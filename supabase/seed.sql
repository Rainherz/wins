-- Wins: demo data. Optional, run by hand in the Supabase SQL Editor.
--
-- Fills the last 90 days with wins for every project you already have (for example the ones
-- imported from GitHub), plus a mood for most of the days that have wins. Weekdays are busier
-- than weekends and each project has its own busy and quiet stretches, so the Week, Projects and
-- Activity screens look lived in.
--
-- Safe to run more than once: every generated win has an external id starting with "seed:",
-- and rows that already exist are skipped. It never touches wins you logged yourself.
--
-- To remove only the demo data:
--   delete from public.wins where external_id like 'seed:%';
--   -- Moods are not tagged, so clear them only if you do not want to keep any:
--   -- delete from public.day_closures;

do $$
declare
  titles text[] := array[
    'Terminé la validación del formulario',
    'Arreglé un bug en el flujo de inicio de sesión',
    'Dejé listo el endpoint de reportes',
    'Revisé y cerré los issues pendientes de la semana',
    'Mejoré el rendimiento de la lista principal',
    'Escribí la documentación de la configuración',
    'Resolví los conflictos y fusioné la rama',
    'Refactoricé el módulo de autenticación',
    'Agregué los estados vacíos y de error',
    'Publiqué una nueva versión en staging',
    'Ajusté el diseño para pantallas pequeñas',
    'Conecté la pantalla con la API',
    'Corregí los textos y la ortografía de la interfaz',
    'Terminé la migración de la base de datos',
    'Actualicé las dependencias sin romper nada',
    'Probé el flujo completo y anoté los detalles',
    'Implementé el filtro por fecha',
    'Cerré la tarea que llevaba días abierta',
    'Dejé el entorno de desarrollo funcionando',
    'Resolví las observaciones de la revisión'
  ];
  total int;
begin
  perform setseed(0.42);

  -- Wins: up to two per project per day, with a weekly rhythm and a slow wave per project.
  insert into public.wins (user_id, project_id, title, is_milestone, achieved_at, external_id)
  select
    p.user_id,
    p.id,
    titles[1 + floor(random() * array_length(titles, 1))::int],
    random() < 0.05,
    -- 14:00 to 22:00 UTC lands inside the working day for most of the Americas.
    (current_date - d.off)::timestamp at time zone 'UTC' + interval '14 hours' + random() * interval '8 hours',
    'seed:' || p.id || ':' || (current_date - d.off) || ':' || n.i
  from public.projects p
  cross join generate_series(0, 89) as d(off)
  cross join generate_series(1, 2) as n(i)
  where p.archived_at is null
    and p.created_at <= now()
    and random() < (
      case when extract(isodow from current_date - d.off) >= 6 then 0.06 else 0.22 end
      * (0.55 + 0.45 * sin(d.off / 6.0 + (abs(hashtext(p.id::text)) % 10)))
      / n.i
    )
  on conflict do nothing;

  -- Moods: about 70% of the days that now have wins.
  insert into public.day_closures (user_id, day, mood)
  select
    w.user_id,
    w.achieved_at::date,
    (array['good', 'good', 'so-so', 'tough'])[1 + floor(random() * 4)::int]
  from public.wins w
  where w.external_id like 'seed:%'
  group by w.user_id, w.achieved_at::date
  having random() < 0.7
  on conflict do nothing;

  select count(*) into total from public.wins where external_id like 'seed:%';
  raise notice 'Demo wins in the database: %', total;
end
$$;
