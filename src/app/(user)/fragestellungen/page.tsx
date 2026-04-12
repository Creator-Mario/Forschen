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
              Stelle eigene Fragestellungen und lass sie von anderen Mitgliedern beantworten.
            </p>
          </div>
          <Link href="/fragestellungen/neu" className="bg-blue-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors text-center">
            + Frage stellen
          </Link>
        </div>

        <div className="bg-blue-50 rounded-xl p-6 mb-8">
          <h2 className="font-semibold text-blue-800 mb-2">Wie funktioniert dieser Bereich?</h2>
          <p className="text-gray-700 text-sm leading-relaxed">
            Hier kann jedes freigeschaltete Mitglied Fragen an die Gemeinschaft richten. Andere Mitglieder können direkt darunter antworten, Gedanken teilen und bei der gemeinsamen Suche nach Klarheit helfen.
          </p>
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
              <div key={question.id} className="bg-white rounded-xl shadow-md p-6">
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
                  <h3 className="font-semibold text-gray-800 mb-3">Antworten der Gemeinschaft</h3>
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
                        placeholder="Teile deinen Gedanken, eine Beobachtung oder einen Hinweis aus der Schrift…"
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
          <div className="text-center py-12 text-gray-500 bg-white rounded-xl shadow-md">
            <p className="text-lg mb-4">Noch keine Fragestellungen vorhanden.</p>
            <Link href="/fragestellungen/neu" className="text-blue-600 hover:text-blue-800 transition-colors">
              Erste Frage stellen →
            </Link>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
