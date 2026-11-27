import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { GraduationCap, Plus, Copy, Check, RefreshCw, Trash2, ArrowLeft, Loader2, Users, Flame, AlertTriangle, ChevronDown, ShieldCheck, Zap } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { Card } from '../UI/Card';
import { Button } from '../UI/Button';
import { ConfirmDialog } from '../Safety/Safety';
import {
  fetchTeacherStatus, requestTeacher, fetchClasses, createClass, rotateClassCode, deleteClass, fetchRoster, fetchStudentDetail, leaveClass,
  classErrorText, type TeacherStatus, type ClassRow, type Roster, type RosterStudent,
} from '../../services/classes';
import type { ChildSummary } from '../../services/family';
import { GRADE_LABEL, type Grade } from '../../lib/profileOptions';

export const TEACHER_MODE_KEY = 'tf_teacher_mode';
const ATTENTION_DAYS = 7;

// Colours for class cards and student avatars (class names written out in full for Tailwind).
const CLASS_STYLE = [
  { bar: 'from-indigo-500 to-purple-500', hover: 'hover:border-indigo-500/40 hover:shadow-indigo-500/15' },
  { bar: 'from-emerald-400 to-teal-500', hover: 'hover:border-emerald-500/40 hover:shadow-emerald-500/15' },
  { bar: 'from-amber-400 to-orange-500', hover: 'hover:border-amber-500/40 hover:shadow-amber-500/15' },
  { bar: 'from-rose-400 to-pink-500', hover: 'hover:border-rose-500/40 hover:shadow-rose-500/15' },
  { bar: 'from-cyan-400 to-sky-500', hover: 'hover:border-cyan-500/40 hover:shadow-cyan-500/15' },
] as const;
const AVATAR_COLORS = [
  'from-indigo-400 to-indigo-600 shadow-indigo-500/30',
  'from-emerald-400 to-emerald-600 shadow-emerald-500/30',
  'from-amber-400 to-orange-500 shadow-amber-500/30',
  'from-rose-400 to-pink-600 shadow-rose-500/30',
  'from-cyan-400 to-sky-600 shadow-cyan-500/30',
  'from-purple-400 to-fuchsia-600 shadow-purple-500/30',
  'from-teal-400 to-teal-600 shadow-teal-500/30',
] as const;
const avatarColor = (name: string) => {
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return AVATAR_COLORS[sum % AVATAR_COLORS.length];
};

const daysSince = (isoDay: string) => (isoDay ? Math.round((Date.parse(new Date().toISOString().slice(0, 10)) - Date.parse(isoDay)) / 86_400_000) : Infinity);
type Sort = 'attention' | 'name' | 'xp' | 'streak';

export const Teacher: React.FC = () => {
  const { language } = useLanguage();
  const tr = (en: string, ru: string, uz: string) => (language === 'ru' ? ru : language === 'uz' ? uz : en);
  const locale = language === 'ru' ? 'ru-RU' : language === 'uz' ? 'uz-UZ' : 'en-US';

  const [status, setStatus] = useState<TeacherStatus | 'loading'>('loading');
  const [statusError, setStatusError] = useState<string | null>(null);

  const refreshStatus = useCallback(async () => {
    try {
      const s = await fetchTeacherStatus();
      setStatus(s);
      setStatusError(null);
      try {
        if (s === 'approved') localStorage.setItem(TEACHER_MODE_KEY, '1');
      } catch {
        /* the sidebar shortcut just will not appear */
      }
    } catch (e) {
      setStatus('none');
      setStatusError(classErrorText(e, tr));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  const header = (
    <div className="flex items-center justify-between gap-6">
      <div className="min-w-0">
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-[var(--text)]">{tr('Teacher cabinet', 'Кабинет учителя', "O'qituvchi kabineti")}</h1>
        <p className="text-[var(--muted)] font-medium mt-2 max-w-2xl">
          {tr(
            'Create a class, share its code, and follow how your students are doing. Students join with their own consent.',
            'Создайте класс, поделитесь кодом и следите за успехами учеников. Ученики присоединяются сами, по своему согласию.',
            "Sinf yarating, kodni ulashing va o'quvchilar muvaffaqiyatini kuzating. O'quvchilar o'z roziligi bilan qo'shiladi."
          )}
        </p>
      </div>
      <div className="hidden sm:flex w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-600 shadow-xl shadow-emerald-500/30 rounded-[1.5rem] items-center justify-center text-white shrink-0" aria-hidden="true">
        <GraduationCap className="w-8 h-8" aria-hidden="true" />
      </div>
    </div>
  );

  if (status === 'loading') {
    return (
      <div className="w-full max-w-5xl mx-auto space-y-8">
        {header}
        <div className="py-10 flex justify-center" role="status" aria-label={tr('Loading', 'Загрузка', 'Yuklanmoqda')}>
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
      {header}
      {status === 'approved' ? <Classes tr={tr} locale={locale} language={language} /> : <RequestAccess status={status} error={statusError} tr={tr} onSent={refreshStatus} />}
    </div>
  );
};

type Tr = (en: string, ru: string, uz: string) => string;

/* ---------------- not approved yet ---------------- */

const RequestAccess: React.FC<{ status: TeacherStatus; error: string | null; tr: Tr; onSent: () => void }> = ({ status, error, tr, onSent }) => {
  const [school, setSchool] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!school.trim() || busy) return;
    setBusy(true);
    setFormError(null);
    try {
      await requestTeacher(school, note);
      onSent();
    } catch (err) {
      setFormError(classErrorText(err, tr));
    } finally {
      setBusy(false);
    }
  };

  if (status === 'pending') {
    return (
      <Card className="relative overflow-hidden p-6 md:p-8 rounded-[2rem] border border-indigo-500/20 space-y-3">
        <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-amber-400 to-orange-500" />
        <h2 className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-amber-500 pt-1">
          <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-500/30">
            <ShieldCheck className="w-4 h-4" aria-hidden="true" />
          </span>
          {tr('Request sent', 'Заявка отправлена', "So'rov yuborildi")}
        </h2>
        <p className="text-[var(--text)] leading-relaxed">
          {tr(
            'We check every teacher before giving access to students. You will see the cabinet here once the request is approved.',
            'Мы проверяем каждого учителя, прежде чем дать доступ к ученикам. Кабинет откроется здесь, когда заявку одобрят.',
            "Biz har bir o'qituvchini o'quvchilarga ruxsat berishdan oldin tekshiramiz. So'rov tasdiqlangach, kabinet shu yerda ochiladi."
          )}
        </p>
        <Button variant="outline" onClick={onSent} className="h-11 px-5 rounded-xl">
          <RefreshCw className="w-4 h-4 mr-2" aria-hidden="true" />
          <span className="font-black uppercase text-xs tracking-wider">{tr('Check again', 'Проверить снова', 'Qayta tekshirish')}</span>
        </Button>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden p-6 md:p-8 rounded-[2rem] border border-[var(--border)] space-y-5">
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-emerald-400 via-teal-500 to-indigo-500" />
      <h2 className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-emerald-500 pt-1">
        <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/30" aria-hidden="true">
          <GraduationCap className="w-4 h-4" />
        </span>
        {tr('Get teacher access', 'Получить доступ учителя', "O'qituvchi huquqini olish")}
      </h2>
      <p className="text-sm text-[var(--muted)] leading-relaxed">
        {tr(
          'A class code shows students’ progress, so an administrator checks every teacher first. Tell us where you teach.',
          'Код класса открывает прогресс учеников, поэтому администратор проверяет каждого учителя. Расскажите, где вы преподаёте.',
          "Sinf kodi o'quvchilar progressini ochadi, shuning uchun administrator har bir o'qituvchini tekshiradi. Qayerda dars berishingizni ayting."
        )}
      </p>
      {error && <p role="alert" className="text-sm font-semibold text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3">{error}</p>}
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="teacher-school" className="text-xs font-black uppercase text-[var(--muted)] tracking-wider block">{tr('School or institution', 'Школа или учреждение', 'Maktab yoki muassasa')}</label>
          <input id="teacher-school" value={school} maxLength={80} onChange={(e) => setSchool(e.target.value)} className="w-full h-12 px-4 bg-[var(--input)] border border-[var(--border)] rounded-2xl text-sm text-[var(--text)] outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10" />
        </div>
        <div className="space-y-2">
          <label htmlFor="teacher-note" className="text-xs font-black uppercase text-[var(--muted)] tracking-wider block">{tr('Subject, class, how to reach you (optional)', 'Предмет, класс, как с вами связаться (по желанию)', "Fan, sinf, siz bilan qanday bog'lanish (ixtiyoriy)")}</label>
          <textarea id="teacher-note" value={note} maxLength={300} onChange={(e) => setNote(e.target.value)} className="w-full h-24 p-4 bg-[var(--input)] border border-[var(--border)] rounded-2xl text-sm text-[var(--text)] outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 resize-none" />
        </div>
        <div role="status" aria-live="polite">{formError && <p role="alert" className="text-sm font-semibold text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3">{formError}</p>}</div>
        <Button type="submit" disabled={!school.trim() || busy} className="h-12 px-6 rounded-2xl gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/25">
          {busy && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
          <span className="font-black uppercase text-xs tracking-wider">{tr('Send request', 'Отправить заявку', "So'rov yuborish")}</span>
        </Button>
      </form>
    </Card>
  );
};

/* ---------------- approved: classes and roster ---------------- */

const Classes: React.FC<{ tr: Tr; locale: string; language: 'en' | 'ru' | 'uz' }> = ({ tr, locale, language }) => {
  const [classes, setClasses] = useState<ClassRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ title: string; text: string; label: string; run: () => Promise<void> } | null>(null);

  const load = useCallback(async () => {
    try {
      setClasses(await fetchClasses());
      setError(null);
    } catch (e) {
      setClasses([]);
      setError(classErrorText(e, tr));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  useEffect(() => {
    load();
  }, [load]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || creating) return;
    setCreating(true);
    setError(null);
    try {
      await createClass(name);
      setName('');
      await load();
    } catch (err) {
      setError(classErrorText(err, tr));
    } finally {
      setCreating(false);
    }
  };

  const copy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      window.prompt('Ctrl+C', code);
    }
  };

  const open = classes?.find((c) => c.classId === openId);
  if (open) return <ClassRoster cls={open} tr={tr} locale={locale} language={language} onBack={() => { setOpenId(null); load(); }} />;

  return (
    <div className="space-y-6">
      <Card className="relative overflow-hidden p-6 md:p-8 rounded-[2rem] border border-[var(--border)] space-y-4">
        <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        <h2 className="flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-indigo-500 pt-1">
          <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/30">
            <Plus className="w-4 h-4" aria-hidden="true" />
          </span>
          {tr('New class', 'Новый класс', 'Yangi sinf')}
        </h2>
        <form onSubmit={create} className="flex gap-2">
          <label htmlFor="class-name" className="sr-only">{tr('Class name', 'Название класса', 'Sinf nomi')}</label>
          <input
            id="class-name"
            value={name}
            maxLength={60}
            onChange={(e) => setName(e.target.value)}
            placeholder={tr('For example: 8B Algebra', 'Например: 8Б Алгебра', 'Masalan: 8B Algebra')}
            className="flex-1 min-w-0 h-12 px-4 bg-[var(--input)] border border-[var(--border)] rounded-2xl text-sm text-[var(--text)] outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 placeholder:text-[var(--muted)] placeholder:opacity-60"
          />
          <Button type="submit" disabled={!name.trim() || creating} className="h-12 px-6 rounded-2xl shrink-0 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/25">
            {creating ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <span className="font-black uppercase text-xs tracking-wider">{tr('Create', 'Создать', 'Yaratish')}</span>}
          </Button>
        </form>
        <div role="status" aria-live="polite">{error && <p role="alert" className="text-sm font-semibold text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3">{error}</p>}</div>
      </Card>

      {classes === null ? (
        <div className="py-8 flex justify-center" role="status" aria-label={tr('Loading', 'Загрузка', 'Yuklanmoqda')}><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
      ) : classes.length === 0 ? (
        <div className="py-12 px-6 text-center rounded-[2rem] border border-dashed border-[var(--border)]">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-600 text-white flex items-center justify-center shadow-xl shadow-indigo-500/30 motion-safe:animate-bounce" aria-hidden="true">
            <Users className="w-8 h-8" />
          </div>
          <p className="font-black text-[var(--text)]">{tr('No classes yet', 'Классов пока нет', "Hali sinflar yo'q")}</p>
          <p className="text-sm text-[var(--muted)] mt-1">{tr('Create one above and give students its code.', 'Создайте класс выше и дайте ученикам его код.', "Yuqorida sinf yarating va o'quvchilarga kodini bering.")}</p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {classes.map((c, idx) => {
            const style = CLASS_STYLE[idx % CLASS_STYLE.length];
            return (
            <li key={c.classId}>
              <Card className={`relative overflow-hidden p-6 rounded-[2rem] border border-[var(--border)] space-y-4 h-full transition-all hover:shadow-xl motion-safe:hover:-translate-y-0.5 ${style.hover}`}>
                <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${style.bar}`} />
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-xl font-black text-[var(--text)] truncate">{c.name}</h3>
                    <p className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-full bg-[var(--input)] text-sm font-bold text-[var(--muted)]"><Users className="w-3.5 h-3.5" aria-hidden="true" />{c.students} {tr('students', 'учеников', "o'quvchi")}</p>
                  </div>
                  <Button
                    variant="outline"
                    aria-label={tr('Delete class', 'Удалить класс', "Sinfni o'chirish")}
                    onClick={() => setConfirm({
                      title: tr('Delete this class?', 'Удалить этот класс?', "Bu sinf o'chirilsinmi?"),
                      text: tr('Students stay in the app; they just stop being in this class.', 'Ученики останутся в приложении, они просто выйдут из этого класса.', "O'quvchilar ilovada qoladi, faqat bu sinfdan chiqadi."),
                      label: tr('Delete', 'Удалить', "O'chirish"),
                      run: async () => { await deleteClass(c.classId); await load(); },
                    })}
                    className="h-11 w-11 p-0 rounded-xl shrink-0 border-rose-500/30 text-rose-500 hover:bg-rose-500 hover:text-white"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </Button>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border border-indigo-500/15 space-y-2">
                  <p className="text-xs font-black uppercase tracking-wider text-[var(--muted)]">{tr('Class code', 'Код класса', 'Sinf kodi')}</p>
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-xl font-black tracking-[0.25em] text-[var(--text)] select-all">{c.code}</span>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => copy(c.code)} aria-label={tr('Copy code', 'Скопировать код', 'Kodni nusxalash')} className={`h-11 w-11 rounded-xl flex items-center justify-center text-white shadow-lg transition-all motion-safe:active:scale-95 ${copied === c.code ? 'bg-gradient-to-br from-emerald-500 to-teal-500 shadow-emerald-500/25' : 'bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-indigo-500/25'}`}>
                        {copied === c.code ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <button
                        type="button"
                        aria-label={tr('Make a new code', 'Сделать новый код', 'Yangi kod yaratish')}
                        title={tr('Make a new code', 'Сделать новый код', 'Yangi kod yaratish')}
                        onClick={() => setConfirm({
                          title: tr('Make a new code?', 'Сделать новый код?', 'Yangi kod yaratasizmi?'),
                          text: tr('The old code stops working. Students who already joined stay in the class.', 'Старый код перестанет работать. Ученики, которые уже вступили, останутся в классе.', "Eski kod ishlamay qoladi. Qo'shilgan o'quvchilar sinfda qoladi."),
                          label: tr('New code', 'Новый код', 'Yangi kod'),
                          run: async () => { await rotateClassCode(c.classId); await load(); },
                        })}
                        className="h-11 w-11 rounded-xl border border-[var(--border)] hover:bg-[var(--card)] flex items-center justify-center text-[var(--text)]"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-[var(--muted)]">{tr('Students enter it in Settings → Parents and teachers.', 'Ученики вводят его в Настройки → Родители и учителя.', "O'quvchilar uni Sozlamalar → Ota-ona va o'qituvchilar bo'limiga kiritadi.")}</p>
                </div>

                <Button onClick={() => setOpenId(c.classId)} className="w-full h-12 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-lg shadow-indigo-500/25">
                  <span className="font-black uppercase text-xs tracking-wider">{tr('Open class', 'Открыть класс', 'Sinfni ochish')}</span>
                </Button>
              </Card>
            </li>
            );
          })}
        </ul>
      )}

      {confirm && (
        <ConfirmDialog title={confirm.title} text={confirm.text} confirmLabel={confirm.label} danger onConfirm={confirm.run} onClose={() => setConfirm(null)} />
      )}
    </div>
  );
};

/* ---------------- one class ---------------- */

const ClassRoster: React.FC<{ cls: ClassRow; tr: Tr; locale: string; language: 'en' | 'ru' | 'uz'; onBack: () => void }> = ({ cls, tr, locale, language, onBack }) => {
  const [roster, setRoster] = useState<Roster | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState<Sort>('attention');
  const [openStudent, setOpenStudent] = useState<string | null>(null);
  const [detail, setDetail] = useState<ChildSummary | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [removing, setRemoving] = useState<RosterStudent | null>(null);

  const load = useCallback(async () => {
    try {
      setRoster(await fetchRoster(cls.classId));
      setError(null);
    } catch (e) {
      setError(classErrorText(e, tr));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cls.classId, language]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleStudent = async (uid: string) => {
    if (openStudent === uid) {
      setOpenStudent(null);
      return;
    }
    setOpenStudent(uid);
    setDetail(null);
    setDetailError(null);
    try {
      setDetail(await fetchStudentDetail(cls.classId, uid));
    } catch (e) {
      setDetailError(classErrorText(e, tr));
    }
  };

  const students = roster?.students ?? [];
  const needsAttention = (s: RosterStudent) => daysSince(s.lastActiveDate) >= ATTENTION_DAYS;
  const stats = useMemo(() => {
    const active = students.filter((s) => daysSince(s.lastActiveDate) < ATTENTION_DAYS).length;
    const avgXp = students.length ? Math.round(students.reduce((n, s) => n + s.xp, 0) / students.length) : 0;
    return { total: students.length, active, attention: students.length - active, avgXp };
  }, [students]);

  const sorted = useMemo(() => {
    const list = [...students];
    if (sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name, locale));
    else if (sort === 'xp') list.sort((a, b) => b.xp - a.xp);
    else if (sort === 'streak') list.sort((a, b) => b.streakDays - a.streakDays);
    else list.sort((a, b) => daysSince(b.lastActiveDate) - daysSince(a.lastActiveDate) || a.name.localeCompare(b.name, locale));
    return list;
  }, [students, sort, locale]);

  const lastActive = (s: { lastActiveDate: string }) => {
    const d = daysSince(s.lastActiveDate);
    if (d === Infinity) return tr('No activity yet', 'Пока нет активности', "Hali faollik yo'q");
    if (d <= 0) return tr('Active today', 'Занимался сегодня', 'Bugun shug‘ullangan');
    if (d === 1) return tr('Yesterday', 'Вчера', 'Kecha');
    return tr(`${d} days ago`, `${d} дн. назад`, `${d} kun oldin`);
  };

  const tiles = [
    { label: tr('Students', 'Учеников', "O'quvchilar"), value: stats.total, icon: Users, tile: 'from-indigo-400 to-indigo-600 shadow-indigo-500/30' },
    { label: tr('Active, last 7 days', 'Активны за 7 дней', "So'nggi 7 kunda faol"), value: stats.active, icon: Flame, tile: 'from-emerald-400 to-teal-600 shadow-emerald-500/30' },
    { label: tr('Need attention', 'Нужно внимание', "E'tibor kerak"), value: stats.attention, icon: AlertTriangle, tile: 'from-amber-400 to-orange-500 shadow-amber-500/30' },
    { label: tr('Average XP', 'Средний XP', "O'rtacha XP"), value: stats.avgXp, icon: GraduationCap, tile: 'from-purple-400 to-fuchsia-600 shadow-purple-500/30' },
  ];

  return (
    <div className="space-y-6">
      <button type="button" onClick={onBack} className="inline-flex items-center gap-2 h-11 px-1 text-sm font-bold text-[var(--muted)] hover:text-[var(--text)] transition-colors">
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        {tr('All classes', 'Все классы', 'Barcha sinflar')}
      </button>
      <h2 className="flex items-center gap-3 text-2xl md:text-3xl font-black text-[var(--text)]">
        <span className="w-11 h-11 shrink-0 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30" aria-hidden="true">
          <Users className="w-5 h-5" />
        </span>
        <span className="min-w-0 truncate">{cls.name}</span>
      </h2>

      {error && <p role="alert" className="text-sm font-semibold text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded-xl p-3">{error}</p>}

      {!roster && !error ? (
        <div className="py-8 flex justify-center" role="status" aria-label={tr('Loading', 'Загрузка', 'Yuklanmoqda')}><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
      ) : roster && (
        <>
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {tiles.map((t) => (
              <div key={t.label} className="flex items-center gap-3 p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)]">
                <span className={`w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br shadow-lg flex items-center justify-center text-white ${t.tile}`} aria-hidden="true"><t.icon className="w-5 h-5" /></span>
                <div className="min-w-0">
                  <dt className="text-[10px] font-black uppercase tracking-wider text-[var(--muted)] leading-tight">{t.label}</dt>
                  <dd className="text-2xl font-black tabular-nums text-[var(--text)] leading-tight">{t.value}</dd>
                </div>
              </div>
            ))}
          </dl>

          {students.length === 0 ? (
            <div className="py-12 px-6 text-center rounded-[2rem] border border-dashed border-[var(--border)]">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-xl shadow-amber-500/30 motion-safe:animate-bounce" aria-hidden="true">
                <Users className="w-8 h-8" />
              </div>
              <p className="font-black text-[var(--text)]">{tr('Nobody has joined yet', 'Пока никто не вступил', "Hali hech kim qo'shilmagan")}</p>
              <p className="text-sm text-[var(--muted)] mt-1">{tr('Give students the code', 'Дайте ученикам код', "O'quvchilarga kodni bering")}: <span className="font-mono font-black tracking-widest text-[var(--text)]">{roster.code}</span></p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="roster-sort" className="text-xs font-black uppercase tracking-wider text-[var(--muted)]">{tr('Sort by', 'Сортировка', 'Saralash')}</label>
                <select id="roster-sort" value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="h-11 px-3 bg-[var(--input)] border border-[var(--border)] rounded-xl text-sm text-[var(--text)] outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10">
                  <option value="attention">{tr('Needs attention first', 'Сначала кому нужно внимание', "Avval e'tibor kerak")}</option>
                  <option value="name">{tr('Name', 'Имя', 'Ism')}</option>
                  <option value="xp">XP</option>
                  <option value="streak">{tr('Streak', 'Серия', 'Seriya')}</option>
                </select>
              </div>

              <ul className="space-y-3">
                {sorted.map((s) => {
                  const grade = s.grade ? (GRADE_LABEL[language]?.[s.grade as Grade] ?? s.grade) : '';
                  const isOpen = openStudent === s.studentUid;
                  return (
                    <li key={s.studentUid}>
                      <Card className={`rounded-3xl border overflow-hidden transition-all hover:shadow-lg ${needsAttention(s) ? 'border-amber-500/30 bg-amber-500/5 hover:shadow-amber-500/10' : 'border-[var(--border)] hover:border-indigo-500/30 hover:shadow-indigo-500/10'}`}>
                        <button
                          type="button"
                          onClick={() => toggleStudent(s.studentUid)}
                          aria-expanded={isOpen}
                          className="w-full text-left p-4 md:p-5 flex items-center gap-4 focus-visible:outline-2 focus-visible:outline-indigo-500"
                        >
                          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br shadow-lg flex items-center justify-center font-black text-white shrink-0 ${avatarColor(s.name || '?')}`} aria-hidden="true">
                            {(s.name || '?')[0].toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-black text-[var(--text)] truncate">{s.name || tr('Student', 'Ученик', "O'quvchi")}</p>
                            <p className="text-xs text-[var(--muted)] truncate">{[grade, lastActive(s)].filter(Boolean).join(' · ')}</p>
                          </div>
                          {needsAttention(s) && (
                            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-black shrink-0">
                              <AlertTriangle className="w-3 h-3" aria-hidden="true" />{tr('Inactive', 'Не занимается', 'Faol emas')}
                            </span>
                          )}
                          <div className="text-right shrink-0">
                            <p className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 font-black text-[var(--text)] tabular-nums"><Zap className="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />{s.xp} XP</p>
                            <p className="text-xs text-[var(--muted)]">{tr('Lessons', 'Уроков', 'Darslar')} {s.lessonsCompleted} · {tr('Lvl', 'Ур.', 'Dar.')} {s.level}{s.streakDays ? ` · ${tr("streak", "серия", "seriya")} ${s.streakDays}` : ''}</p>
                          </div>
                          <ChevronDown className={`w-4 h-4 text-[var(--muted)] shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                        </button>

                        {isOpen && (
                          <div className="px-4 md:px-5 pb-5 space-y-4 border-t border-[var(--border)] pt-4">
                            {detailError ? (
                              <p role="alert" className="text-sm font-semibold text-rose-500">{detailError}</p>
                            ) : !detail ? (
                              <Loader2 className="w-5 h-5 animate-spin text-indigo-500" aria-label={tr('Loading', 'Загрузка', 'Yuklanmoqda')} />
                            ) : (
                              <>
                                <p className="text-sm text-[var(--text)]">
                                  {tr(`Finished tasks: ${detail.tasksCompleted}. Finished lessons: ${detail.lessonsCompleted}. Best streak: ${detail.longestStreak} days.`, `Выполнено заданий: ${detail.tasksCompleted}. Пройдено уроков: ${detail.lessonsCompleted}. Лучшая серия: ${detail.longestStreak} дн.`, `Bajarilgan vazifalar: ${detail.tasksCompleted}. Tugagan darslar: ${detail.lessonsCompleted}. Eng yaxshi seriya: ${detail.longestStreak} kun.`)}
                                </p>
                                <div className="grid grid-cols-7 gap-2" role="img" aria-label={tr('Study days in the last week', 'Дни занятий за неделю', "So'nggi hafta o'qish kunlari")}>
                                  {detail.week.map((d) => (
                                    <div key={d.date} className="flex flex-col items-center gap-1.5">
                                      <div className={`w-full h-8 rounded-lg ${d.active ? 'bg-gradient-to-b from-indigo-500 to-purple-600' : 'bg-[var(--input)]'}`} />
                                      <span className="text-xs text-[var(--muted)]">{new Date(`${d.date}T00:00:00Z`).toLocaleDateString(locale, { weekday: 'short', timeZone: 'UTC' })}</span>
                                    </div>
                                  ))}
                                </div>
                              </>
                            )}
                            <Button variant="outline" onClick={() => setRemoving(s)} className="h-11 px-4 rounded-xl border-rose-500/30 text-rose-500 hover:bg-rose-500 hover:text-white">
                              <span className="font-black uppercase text-xs tracking-wider">{tr('Remove from class', 'Убрать из класса', 'Sinfdan chiqarish')}</span>
                            </Button>
                          </div>
                        )}
                      </Card>
                    </li>
                  );
                })}
              </ul>
            </>
          )}

          <p className="flex items-start gap-2 text-xs text-[var(--muted)] leading-relaxed">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
            {tr(
              'You see name, grade, XP, level, streaks, finished tasks and study days. Never email, messages, posts or AI chats. Students can leave the class at any time.',
              'Вы видите имя, класс, XP, уровень, серии, выполненные задания и дни занятий. Почта, сообщения, посты и чаты с ИИ недоступны. Ученик может выйти из класса в любой момент.',
              "Siz ism, sinf, XP, daraja, seriyalar, bajarilgan vazifalar va o'qish kunlarini ko'rasiz. Pochta, xabarlar, postlar va AI suhbatlari ko'rinmaydi. O'quvchi sinfdan istalgan vaqtda chiqa oladi."
            )}
          </p>
        </>
      )}

      {removing && (
        <ConfirmDialog
          title={tr('Remove this student?', 'Убрать ученика из класса?', "O'quvchini sinfdan chiqarasizmi?")}
          text={tr(`${removing.name || 'The student'} will leave the class and you will stop seeing their progress. They can join again with the code.`, `${removing.name || 'Ученик'} выйдет из класса, и вы перестанете видеть его прогресс. Он сможет вступить снова по коду.`, `${removing.name || "O'quvchi"} sinfdan chiqadi va siz uning progressini ko'rmaysiz. Kod bilan qayta qo'shilishi mumkin.`)}
          confirmLabel={tr('Remove', 'Убрать', 'Chiqarish')}
          danger
          onConfirm={async () => { await leaveClass(cls.classId, removing.studentUid); setOpenStudent(null); await load(); }}
          onClose={() => setRemoving(null)}
        />
      )}
    </div>
  );
};
