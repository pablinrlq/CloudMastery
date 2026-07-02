"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signup, loginWithGoogle } from "../actions";

export default function SignupPage() {
  const [state, action, pending] = useActionState(signup, undefined);

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-sm flex-col justify-center px-4">
      <h1 className="mb-6 text-2xl font-semibold">Criar conta</h1>

      <form action={action} className="flex flex-col gap-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">
            Senha
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            className="w-full rounded-md border border-gray-300 px-3 py-2"
          />
        </div>
        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-orange-500 px-4 py-2 font-medium text-white disabled:opacity-50"
        >
          {pending ? "Criando..." : "Criar conta"}
        </button>
      </form>

      <form action={loginWithGoogle} className="mt-3">
        <button
          type="submit"
          className="w-full rounded-md border border-gray-300 px-4 py-2 font-medium"
        >
          Continuar com Google
        </button>
      </form>

      <p className="mt-6 text-sm text-gray-600">
        Já tem conta?{" "}
        <Link href="/login" className="text-orange-600 underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
