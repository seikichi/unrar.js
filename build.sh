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

emcc \
    -s TOTAL_MEMORY=167772160 \
    -s TOTAL_STACK=52428800 \
    -O2 \
    -s ASM_JS=0 \
    -s EXPORTED_FUNCTIONS="["\
"'_urarlib_list',"\
"'_urarlib_freelist',"\
"'_urarlib_get',"\
"'_get_item_from_archive_list',"\
"'_get_next_from_archive_list',"\
"'_get_name_from_archive_entry',"\
"'_get_pack_size_from_archive_entry',"\
"'_get_unp_size_from_archive_entry',"\
"'_get_host_os_from_archive_entry',"\
"'_get_file_time_from_archive_entry',"\
"'_get_file_attr_from_archive_entry',"\
"'FS']" \
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
    -D UNPACK29_KEEP_TEMP_FILE\
    -I unrar/src \
    -o _unrar.js
cat _unrar.js export.js > unrar.js
closure --js=unrar.js --output_wrapper="(function(){%output%})();" > unrar.min.js
