ALTER TABLE "configuracoes_pomodoro"
ADD CONSTRAINT "configuracoes_pomodoro_tempo_pomodoro_minutos_check"
CHECK ("tempoPomodoroMinutos" BETWEEN 1 AND 59);

ALTER TABLE "configuracoes_pomodoro"
ADD CONSTRAINT "configuracoes_pomodoro_tempo_descanso_curto_minutos_check"
CHECK ("tempoDescansoCurtoMinutos" BETWEEN 1 AND 59);

ALTER TABLE "configuracoes_pomodoro"
ADD CONSTRAINT "configuracoes_pomodoro_tempo_descanso_longo_minutos_check"
CHECK ("tempoDescansoLongoMinutos" BETWEEN 1 AND 59);

ALTER TABLE "configuracoes_pomodoro"
ADD CONSTRAINT "configuracoes_pomodoro_pomodoros_para_descanso_longo_check"
CHECK ("pomodorosParaDescansoLongo" BETWEEN 1 AND 99);

ALTER TABLE "sessoes_pomodoro"
ADD CONSTRAINT "sessoes_pomodoro_duracao_minutos_check"
CHECK ("duracaoMinutos" BETWEEN 1 AND 59);

ALTER TABLE "resumos_diarios"
ADD CONSTRAINT "resumos_diarios_pomodoros_realizados_check"
CHECK ("pomodorosRealizados" BETWEEN 0 AND 1000);

ALTER TABLE "resumos_diarios"
ADD CONSTRAINT "resumos_diarios_descansos_curtos_realizados_check"
CHECK ("descansosCurtosRealizados" BETWEEN 0 AND 1000);

ALTER TABLE "resumos_diarios"
ADD CONSTRAINT "resumos_diarios_descansos_longos_realizados_check"
CHECK ("descansosLongosRealizados" BETWEEN 0 AND 1000);

ALTER TABLE "resumos_diarios"
ADD CONSTRAINT "resumos_diarios_tempo_estudando_minutos_check"
CHECK ("tempoEstudandoMinutos" >= 0);

ALTER TABLE "resumos_diarios"
ADD CONSTRAINT "resumos_diarios_tempo_descanso_minutos_check"
CHECK ("tempoDescansoMinutos" >= 0);
