#include <time.h>
#include "unrarlib.h"

struct RAR20_archive_entry* get_item_from_archive_list(ArchiveList_struct* archive) {
  return &archive->item;
}

ArchiveList_struct* get_next_from_archive_list(ArchiveList_struct* archive) {
  return archive->next;
}

char* get_name_from_archive_entry(struct RAR20_archive_entry *entry) {
  return entry->Name;
}

UWORD get_name_size_from_archive_entry(struct RAR20_archive_entry *entry) {
  return entry->NameSize;
}

UDWORD get_pack_size_from_archive_entry(struct RAR20_archive_entry *entry) {
  return entry->PackSize;
}

UDWORD get_unp_size_from_archive_entry(struct RAR20_archive_entry *entry) {
  return entry->UnpSize;
}

UBYTE get_host_os_from_archive_entry(struct RAR20_archive_entry *entry) {
  return entry->HostOS;
}

UDWORD get_file_crc_from_archive_entry(struct RAR20_archive_entry *entry) {
  return entry->FileCRC;
}

UDWORD get_file_time_from_archive_entry(struct RAR20_archive_entry *entry) {
  return entry->FileTime;
}

UBYTE get_unp_ver_from_archive_entry(struct RAR20_archive_entry *entry) {
  return entry->UnpVer;
}

UBYTE get_method_from_archive_entry(struct RAR20_archive_entry *entry) {
  return entry->Method;
}

UDWORD get_file_attr_from_archive_entry(struct RAR20_archive_entry *entry) {
  return entry->FileAttr;
}

/*
 * dos_to_unix_time came from unzip sources.
 */

#define DOSTIME_2038_01_18 ((unsigned long)0x74320000L)
#define U_TIME_T_MAX  ((time_t)(unsigned long)0xffffffffL)
#define S_TIME_T_MAX  ((time_t)(unsigned long)0x7fffffffL)
#define YRBASE  1900

time_t
dos_to_unix_time (unsigned long dosdatetime)
{
  time_t m_time;
  struct tm *tm;
  time_t now = time (NULL);

  tm = localtime (&now);
  tm->tm_isdst = -1;		/* let mktime determine if DST is in effect */

  /* dissect date */
  tm->tm_year = ((int) (dosdatetime >> 25) & 0x7f) + (1980 - YRBASE);
  tm->tm_mon = ((int) (dosdatetime >> 21) & 0x0f) - 1;
  tm->tm_mday = ((int) (dosdatetime >> 16) & 0x1f);

  /* dissect time */
  tm->tm_hour = (int) ((unsigned) dosdatetime >> 11) & 0x1f;
  tm->tm_min = (int) ((unsigned) dosdatetime >> 5) & 0x3f;
  tm->tm_sec = (int) ((unsigned) dosdatetime << 1) & 0x3e;

  m_time = mktime (tm);

  if ((dosdatetime >= DOSTIME_2038_01_18) && (m_time < (time_t) 0x70000000L))
    m_time = U_TIME_T_MAX;	/* saturate in case of (unsigned) overflow */
  if (m_time < (time_t) 0L)	/* a converted DOS time cannot be negative */
    m_time = S_TIME_T_MAX;	/*  -> saturate at max signed time_t value */
  return m_time;
}

