'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { formatDate } from '@/lib/utils';
import type { CommunityQuestion } from '@/types';

export default function FragestellungenPage() {
  const [questions, setQuestions] = useState<CommunityQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [answerDrafts, setAnswerDrafts] = useState<Record<string, string>>({});
  const [submittingQuestionId, setSubmittingQuestionId] = useState<string | null>(null);

  const answeredQuestions = questions.filter(question => question.answers.length > 0).length;
  const totalAnswers = questions.reduce((sum, question) => sum + question.answers.length, 0);

  useEffect(() => {
    fetch('/api/fragestellungen')
      .then(r => r.ok ? r.json() : Promise.reject(new Error('load_failed')))
      .then((data: CommunityQuestion[]) => {
        if (Array.isArray(data)) setQuestions(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Die Fragestellungen konnten gerade nicht geladen werden.');
        setLoading(false);
      });
  }, []);

  async function handleAnswerSubmit(e: FormEvent<HTMLFormElement>, questionId: string) {
    e.preventDefault();
    const content = answerDrafts[questionId]?.trim();
    if (!content) return;

    setSubmittingQuestionId(questionId);
    setError('');

    const res = await fetch(`/api/fragestellungen/${questionId}/antworten`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    const data = await res.json();
    setSubmittingQuestionId(null);

    if (!res.ok) {
      setError(data.error || 'Die Antwort konnte nicht gespeichert werden.');
      return;
    }

    setQuestions(current => current.map(question => (
      question.id === questionId ? data.question : question
    )));
    setAnswerDrafts(current => ({ ...current, [questionId]: '' }));
  }

  return (
    <ProtectedRoute>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-blue-800 mb-2">Fragen an die Gemeinschaft</h1>
            <p className="text-gray-500">
              Ein gemeinsamer Raum für sorgfältige Fragen, hilfreiche Antworten und respektvollen Austausch.
            </p>
          </div>
          <Link href="/fragestellungen/neu" className="bg-blue-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors text-center">
            + Frage stellen
          </Link>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-slate-50 border border-blue-100 rounded-2xl p-6 mb-8">
          <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr] lg:items-start">
            <div>
              <h2 className="font-semibold text-blue-900 mb-2">Wie dieser Bereich gedacht ist</h2>
              <p className="text-gray-700 text-sm leading-relaxed mb-4">
                Stelle hier Fragen, die dich in deinem Glauben, beim Bibellesen oder im persönlichen Alltag beschäftigen. Andere Mitglieder können direkt antworten, Gedanken einordnen und mit dir gemeinsam weiterdenken.
              </p>
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-white/80 border border-white px-4 py-3">
                  <div className="font-medium text-gray-800 mb-1">Sorgfältig fragen</div>
                  <p className="text-gray-600">Formuliere dein Anliegen klar und gib bei Bedarf kurz den Hintergrund an.</p>
                </div>
                <div className="rounded-xl bg-white/80 border border-white px-4 py-3">
                  <div className="font-medium text-gray-800 mb-1">Respektvoll antworten</div>
                  <p className="text-gray-600">Antworte verständlich, sachlich und mit Blick auf den gemeinsamen Aufbau.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-white border border-blue-100 px-4 py-4 text-center">
                <div className="text-2xl font-bold text-blue-800">{questions.length}</div>
                <div className="text-xs text-gray-500 mt-1">Fragen</div>
              </div>
              <div className="rounded-xl bg-white border border-blue-100 px-4 py-4 text-center">
                <div className="text-2xl font-bold text-blue-800">{answeredQuestions}</div>
                <div className="text-xs text-gray-500 mt-1">beantwortet</div>
              </div>
              <div className="rounded-xl bg-white border border-blue-100 px-4 py-4 text-center">
                <div className="text-2xl font-bold text-blue-800">{totalAnswers}</div>
                <div className="text-xs text-gray-500 mt-1">Antworten</div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-gray-400">Wird geladen...</p>
        ) : questions.length > 0 ? (
          <div className="space-y-6">
            {questions.map(question => (
              <div key={question.id} className="bg-white rounded-2xl shadow-md p-6 border border-slate-100">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">{question.title}</h2>
                    <p className="text-xs text-gray-400 mt-1">
                      Von {question.authorName} · {formatDate(question.createdAt)}
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                    {question.answers.length} Antworten
                  </span>
                </div>

                <p className="text-gray-700 leading-relaxed mb-5">{question.content}</p>

                <div className="border-t border-gray-100 pt-5">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <h3 className="font-semibold text-gray-800">Antworten der Gemeinschaft</h3>
                    <span className="text-xs text-gray-400">
                      {question.answers.length === 0 ? 'Noch offen' : 'Im Austausch'}
                    </span>
                  </div>
                  {question.answers.length > 0 ? (
                    <div className="space-y-3 mb-5">
                      {question.answers.map(answer => (
                        <div key={answer.id} className="rounded-lg bg-slate-50 border border-slate-100 px-4 py-3">
                          <p className="text-gray-700 text-sm leading-relaxed">{answer.content}</p>
                          <p className="text-xs text-gray-400 mt-2">
                            {answer.authorName} · {formatDate(answer.createdAt)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 mb-5">Noch keine Antworten vorhanden.</p>
                  )}

                  <form onSubmit={(e) => handleAnswerSubmit(e, question.id)} className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Deine Antwort
                      <textarea
                        value={answerDrafts[question.id] ?? ''}
                        onChange={e => setAnswerDrafts(current => ({ ...current, [question.id]: e.target.value }))}
                        rows={4}
                        required
                        className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        placeholder="Antworte klar, freundlich und wenn möglich mit einer hilfreichen Beobachtung oder einem Schriftbezug…"
                      />
                    </label>
                    <button
                      type="submit"
                      disabled={submittingQuestionId === question.id}
                      className="bg-blue-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors disabled:opacity-60"
                    >
                      {submittingQuestionId === question.id ? 'Wird gesendet…' : 'Antwort senden'}
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 bg-white rounded-2xl shadow-md border border-slate-100">
            <div className="text-4xl mb-4">❓</div>
            <p className="text-lg font-medium text-gray-700 mb-2">Noch keine Fragen vorhanden.</p>
            <p className="text-sm text-gray-500 mb-5">
              Eröffne die erste Fragestellung und lade die Gemeinschaft zum gemeinsamen Nachdenken ein.
            </p>
            <Link href="/fragestellungen/neu" className="text-blue-600 hover:text-blue-800 transition-colors font-medium">
              Erste Frage stellen →
            </Link>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
