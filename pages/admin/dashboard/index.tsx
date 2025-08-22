'use client'

import styles from "../../page.module.css";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import useSWR from "swr";
import { DataTable, DataTableFilterMeta } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { Tag } from "primereact/tag";
import { classNames } from "primereact/utils";
import { FilterMatchMode } from "primereact/api";

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  verified?: boolean;
  createdAt?: string;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function UsersTable() {
  const { data, error, isLoading } = useSWR<User[]>("/api/v1/users", fetcher);

  const [filters, setFilters] = useState<DataTableFilterMeta>({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    username: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    email: { value: null, matchMode: FilterMatchMode.STARTS_WITH },
    role: { value: null, matchMode: FilterMatchMode.EQUALS },
  });

  const [globalFilterValue, setGlobalFilterValue] = useState<string>("");

  const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    let _filters = { ...filters };
    _filters["global"].value = value;

    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  const renderHeader = () => {
    return (
      <div className="flex justify-content-end">
        <IconField iconPosition="left">
          <InputIcon className="pi pi-search" />
          <InputText
            value={globalFilterValue}
            onChange={onGlobalFilterChange}
            placeholder="Buscar usuário..."
          />
        </IconField>
      </div>
    );
  };

  const roleBodyTemplate = (rowData: User) => {
    return <Tag value={rowData.role} severity={rowData.role === "admin" ? "success" : "info"} />;
  };

  const verifiedBodyTemplate = (rowData: User) => {
    return (
      <i
        className={classNames("pi", {
          "true-icon pi-check-circle text-green-500": rowData.verified,
          "false-icon pi-times-circle text-red-500": !rowData.verified,
        })}
      ></i>
    );
  };

  if (error) return <div>Erro ao carregar usuários.</div>;

  return (
    <div className="card">
      <h2>Usuários</h2>
      <DataTable
        value={data || []}
        paginator
        rows={10}
        dataKey="id"
        filters={filters}
        filterDisplay="row"
        loading={isLoading}
        globalFilterFields={["username", "email", "role"]}
        header={renderHeader()}
        emptyMessage="Nenhum usuário encontrado."
      >
        <Column
          field="username"
          header="Username"
          filter
          filterPlaceholder="Buscar por username"
          style={{ minWidth: "12rem" }}
        />
        <Column
          field="email"
          header="Email"
          filter
          filterPlaceholder="Buscar por email"
          style={{ minWidth: "16rem" }}
        />
        <Column
          field="role"
          header="Role"
          showFilterMenu={false}
          body={roleBodyTemplate}
          style={{ minWidth: "10rem" }}
        />
        <Column
          field="verified"
          header="Verificado"
          dataType="boolean"
          body={verifiedBodyTemplate}
          style={{ minWidth: "8rem" }}
        />
        <Column
          field="created_at"
          header="Criado em"
          body={(rowData) =>
            rowData.created_at	
              ? new Date(rowData.created_at	).toLocaleDateString("pt-BR")
              : "-"
          }
          style={{ minWidth: "10rem" }}
        />
      </DataTable>
    </div>
  );
}


export default function Dashboard() {
  const router = useRouter();

  // --- SWR para validar se migrations estão aplicadas ---
  const { data, error, isLoading } = useSWR("/api/v1/user", fetcher);

  useEffect(() => {
    if (data) {
      // aqui você define sua validação
      if (
        data.status === "done" ||
        (Array.isArray(data) && data.length === 0)
      ) {
        router.push("/admin/login");
      }
    }
  }, [data, router]);

  return (
    <div className={styles.page}>
      <h1>Usuarios : </h1>
      {isLoading ? <></> : <UsersTable />}
    </div>
  );
}
