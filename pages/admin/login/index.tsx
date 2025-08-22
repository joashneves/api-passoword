"use client";

import React, { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { useRouter } from "next/router";

export default function Login() {
  const [userOrEmail, setUserOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleLogin = async () => {
    if (!userOrEmail || !password) {
      alert("Preencha todos os campos");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/v1/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userOrEmail, // username ou email
          password,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Erro ao fazer login");
      }

      const resCookie = await fetch("/api/v1/user");

      const data = await resCookie.json();
      console.log(data);
      // aqui você pode salvar token/cookie
      alert(`Bem-vindo, ${data.username || data.email}`);
      router.push("/admin/dashboard"); // redireciona após login
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card w-full md:w-5 mx-auto mt-5">
      <h1>Login</h1>
      <div className="flex flex-column gap-3 py-5">
        <div className="flex flex-column gap-2">
          <label htmlFor="userOrEmail" className="p-hidden-accessible">
            Username ou Email
          </label>
          <InputText
            id="userOrEmail"
            value={userOrEmail}
            placeholder="Username ou Email"
            onChange={(e) => setUserOrEmail(e.target.value)}
          />
        </div>

        <div className="flex flex-column gap-2">
          <label htmlFor="password" className="p-hidden-accessible">
            Password
          </label>
          <Password
            id="password"
            value={password}
            placeholder="Senha"
            onChange={(e) => setPassword(e.target.value)}
            toggleMask
          />
        </div>

        <Button
          label={loading ? "Entrando..." : "Login"}
          icon="pi pi-user"
          className="w-10rem mx-auto"
          onClick={handleLogin}
          disabled={loading}
        />
      </div>
    </div>
  );
}
