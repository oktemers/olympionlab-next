-- V14 READ-ONLY preflight. Run in Supabase SQL Editor after migration 0003.
-- Expected: first two CAN_UPDATE=false; next columns true;
-- CAN_INSERT_PAYMENTS=false; course progression tables should exist with RLS enabled.

select 'authenticated:profiles.role update' as check_name,
       has_column_privilege('authenticated','public.profiles','role','UPDATE') as permitted
union all
select 'authenticated:profiles.plan update',
       has_column_privilege('authenticated','public.profiles','plan','UPDATE')
union all
select 'authenticated:profiles.branch update',
       has_column_privilege('authenticated','public.profiles','branch','UPDATE')
union all
select 'authenticated:profiles.level update',
       has_column_privilege('authenticated','public.profiles','level','UPDATE')
union all
select 'authenticated:payments insert',
       has_table_privilege('authenticated','public.payments','INSERT');

select expected.table_name,
       to_regclass('public.'||expected.table_name) is not null as table_exists,
       COALESCE(cls.relrowsecurity,false) as row_level_security_enabled
from (values ('profiles'),('payments'),('course_sections'),('lesson_videos'),('user_video_progress')) expected(table_name)
left join pg_class cls on cls.oid=to_regclass('public.'||expected.table_name);

-- Inspect effective policies, particularly student progress and membership.
select tablename,policyname,cmd,roles,qual,with_check
from pg_policies
where schemaname='public'
  and tablename in ('profiles','payments','course_sections','lesson_videos','user_video_progress')
order by tablename,policyname;
