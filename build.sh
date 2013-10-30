#!/bin/bash

unset CVS_RSH
_cvsroot=":pserver:anonymous:@cvs.gna.org:/cvs/"
_cvsmod="unrar"
if [ -d "${_cvsmod}/CVS" ]; then
    cd "${_cvsmod}"
    cvs -q update -dA
else
    cvs -q -z3 "-d${_cvsroot}/${_cvsmod}" co "${_cvsmod}"
    cd "${_cvsmod}"
fi
cd ..
patch -p0 -E < unrar-free.patch

# export EMCC_CFLAGS="-O2"

emcc \
    -s LINKABLE=1 \
    -s ALLOW_MEMORY_GROWTH=1 \
    export.c \
    unrar/src/unpack29.c \
    unrar/src/unrar15.c \
    unrar/src/unrarcmd.c \
    unrar/src/unrarppm.c \
    unrar/src/unrar20.c \
    unrar/src/unrarfilter.c \
    unrar/src/unrarvm.c \
    unrar/src/unrar29.c \
    unrar/src/unrarlib.c \
    -I unrar/src \
    -o _unrar.js
cat _unrar.js export.js > unrar.js
closure --js=unrar.js --output_wrapper="(function(){%output%})();" > unrar.min.js
