
---

# 🧾 Gestão inteligente

Este repositório implementa um **sistema de gestão de inventário 100% front-end**.
O projeto, descrito como `"inventory-management-system"` no `package.json`, foi desenvolvido com:

* **React** + **Vite**
* **TypeScript**
* **Tailwind CSS**

---

## 🏗️ Estrutura Geral

### 🧠 Contextos de Dados

A aplicação utiliza **Context API** para gerenciar o estado de todas as entidades:

* Usuários (`AuthContext`)
* Produtos e categorias (`ProductContext`)
* Clientes
* Fornecedores
* Pedidos
* Transações

📦 Todos os dados são **persistidos no `LocalStorage`** via o hook personalizado `useLocalStorage`.

#### Exemplo:

* `AuthContext`: Define usuários iniciais e gerencia login/logout com persistência local.
* `ProductContext`: Gerencia produtos e categorias com funções **CRUD**, busca e geração de **relatórios de estoque**.

---

## 🧭 Navegação e Rotas

O roteamento principal é definido em `App.tsx`, com uso do `<Router>`:

* Cada rota é protegida por `ProtectedRoute`, que **verifica autenticação** antes de renderizar as páginas:

  * Dashboard
  * Produtos
  * Clientes
  * Etc.

---

## 🔧 Utilidades

* `src/lib/search.ts` → `searchArray`: Filtragem, ordenação e paginação para buscas.
* `src/lib/order.ts` → Funções para:

  * Cálculo do **total de pedidos**
  * Geração de **números de pedido sequenciais**

---

## 📄 Páginas e Componentes

Cada página (`src/pages/Products.tsx`, por exemplo) usa seu respectivo contexto.

✨ A interface é construída com **componentes reutilizáveis** em `src/components/ui/`.

---

## 🔁 Fluxo Típico

1. **Login**

   * Realizado via `AuthContext`
   * Token e usuário são salvos no `LocalStorage`
   * Acesso liberado às rotas protegidas

2. **Cadastro e Listagem**

   * Manipulação de entidades como produtos, clientes e fornecedores
   * Utiliza formulários e listagens
   * **Todos os dados são salvos localmente**, sem backend

3. **Relatórios**

   * Funções nos contextos geram relatórios de:

     * Estoque
     * Vendas
     * Finanças

---

## ✅ Resumo

> Este projeto é uma **SPA (Single Page Application)** para gerenciamento de inventário.
> Toda a lógica de dados ocorre no **client-side**, utilizando `Context API`, `LocalStorage` e hooks personalizados para persistência de informações.

---

