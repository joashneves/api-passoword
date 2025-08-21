import { Message } from "primereact/message";
import { Button } from "primereact/button";
import React, { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import styles from "./page.module.css";
import useSWRMutation from "swr/mutation";

type CreateUserPayload = {
  username: string;
  password: string;
};

// --- Função fetcher genérica para POST ---
async function postFetcher<Payload, Response>(
  url: string,
  { arg }: { arg: Payload },
): Promise<Response> {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(arg),
  });

  if (!res.ok) {
    throw new Error(`Erro: ${res.status}`);
  }

  return res.json();
}

function InitialForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  // Hook para migrations
  const { trigger: runMigrations, isMutating: isMigrating } = useSWRMutation(
    "/api/v1/migrations",
    postFetcher,
  );

  // Hook para criar usuário
  const { trigger: createUser, isMutating: isCreating } = useSWRMutation<
    CreateUserPayload,
    any
  >("/api/v1/users", postFetcher);

  async function CreateUserAdmin(
    username: string,
    email: string,
    password: string,
  ) {
    try {
      // 1. roda migrations
      await runMigrations({}); // sem body
      //alert(`Criando usuario: ${username}, ${password}`);

      // 2. cria usuário
      await createUser({
        username: username,
        email: email,
        password: password,
      });
      alert("Usuário criado com sucesso!");
    } catch (err: any) {
      alert(`Erro: ${err.message}`);
    }
  }

  return (
    <>
      <div className="card">
        <div className="w-full md:w-5 flex flex-column align-items-center justify-content-center gap-3 py-5">
          <div className="flex flex-wrap justify-content-center align-items-center gap-2">
            <label htmlFor="username" className="p-hidden-accessible">
              Username
            </label>
            <InputText
              value={username}
              placeholder="Username"
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap justify-content-center align-items-center gap-2">
            <label htmlFor="Email" className="p-hidden-accessible">
              Email
            </label>
            <InputText
              value={email}
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap justify-content-center align-items-center gap-2">
            <label htmlFor="password" className="p-hidden-accessible">
              Password
            </label>
            <Password
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              toggleMask
            />
          </div>
          <Button
            label={
              isMigrating
                ? "Rodando migrations..."
                : isCreating
                  ? "Criando usuário..."
                  : "Login"
            }
            icon="pi pi-user"
            className="w-10rem mx-auto"
           onClick={() => CreateUserAdmin(username, email, password)} // ✅ aqui
  //             disabled={isMigrating || isCreating}
          />
        </div>
      </div>
    </>
  );
}

export default function Home() {
  return (
    <div className={styles.page}>
      <h1>Hellow word</h1>
      <InitialForm />
    </div>
  );
}
