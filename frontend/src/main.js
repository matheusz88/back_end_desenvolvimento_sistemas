import "./style.css";


// ========================================
// ELEMENTOS GERAIS
// ========================================

const authContainer =
  document.getElementById(
    "authContainer"
  );

const switchMode =
  document.getElementById(
    "switchMode"
  );

const panelTitle =
  document.getElementById(
    "panelTitle"
  );

const panelDescription =
  document.getElementById(
    "panelDescription"
  );

const panelBadge =
  document.getElementById(
    "panelBadge"
  );

const panelQuestion =
  document.getElementById(
    "panelQuestion"
  );


// ========================================
// LOGIN
// ========================================

const loginForm =
  document.getElementById(
    "loginForm"
  );

const loginEmail =
  document.getElementById(
    "loginEmail"
  );

const loginSenha =
  document.getElementById(
    "loginSenha"
  );

const mensagemLogin =
  document.getElementById(
    "mensagemLogin"
  );

const btnEntrar =
  document.getElementById(
    "btnEntrar"
  );


// ========================================
// CADASTRO
// ========================================

const cadastroForm =
  document.getElementById(
    "cadastroForm"
  );

const cadastroNome =
  document.getElementById(
    "cadastroNome"
  );

const cadastroEmail =
  document.getElementById(
    "cadastroEmail"
  );

const cadastroSenha =
  document.getElementById(
    "cadastroSenha"
  );

const confirmarSenha =
  document.getElementById(
    "confirmarSenha"
  );

const mensagemCadastro =
  document.getElementById(
    "mensagemCadastro"
  );

const btnCadastrar =
  document.getElementById(
    "btnCadastrar"
  );


// ========================================
// BOTÕES MOBILE
// ========================================

const mobileIrCadastro =
  document.getElementById(
    "mobileIrCadastro"
  );

const mobileIrLogin =
  document.getElementById(
    "mobileIrLogin"
  );


// ========================================
// CONTROLE DO PAINEL
// ========================================

let modoCadastro = false;


function atualizarModo() {

  if (modoCadastro) {

    authContainer.classList.add(
      "cadastro-ativo"
    );

    panelBadge.textContent =
      "Acesso MediFlow";

    panelTitle.textContent =
      "Que bom ter você por aqui.";

    panelDescription.textContent =
      "Se você já possui uma conta, entre novamente e continue gerenciando sua clínica.";

    panelQuestion.textContent =
      "Já possui uma conta?";

    switchMode.textContent =
      "Entrar";

  } else {

    authContainer.classList.remove(
      "cadastro-ativo"
    );

    panelBadge.textContent =
      "Gestão médica inteligente";

    panelTitle.textContent =
      "Sua clínica organizada em um só lugar.";

    panelDescription.textContent =
      "Gerencie pacientes, médicos e consultas através de uma plataforma simples, segura e moderna.";

    panelQuestion.textContent =
      "Ainda não possui uma conta?";

    switchMode.textContent =
      "Cadastre-se";
  }

}


function irParaCadastro() {

  modoCadastro = true;

  limparMensagens();

  atualizarModo();

}


function irParaLogin() {

  modoCadastro = false;

  limparMensagens();

  atualizarModo();

}


// BOTÃO DO PAINEL

switchMode.addEventListener(
  "click",
  () => {

    modoCadastro =
      !modoCadastro;

    limparMensagens();

    atualizarModo();

  }
);


// MOBILE

mobileIrCadastro.addEventListener(
  "click",
  irParaCadastro
);

mobileIrLogin.addEventListener(
  "click",
  irParaLogin
);


// ========================================
// MOSTRAR / ESCONDER SENHAS
// ========================================

document
  .querySelectorAll(
    ".show-password"
  )
  .forEach((botao) => {

    botao.addEventListener(
      "click",
      () => {

        const idCampo =
          botao.dataset.target;

        const campo =
          document.getElementById(
            idCampo
          );

        const mostrando =
          campo.type === "text";

        campo.type =
          mostrando
            ? "password"
            : "text";

        botao.textContent =
          mostrando
            ? "Mostrar"
            : "Ocultar";

      }
    );

  });


// ========================================
// LOGIN
// ========================================

loginForm.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();

    limparMensagem(
      mensagemLogin
    );

    const email =
      loginEmail.value.trim();

    const senha =
      loginSenha.value;

    if (!email || !senha) {

      mostrarMensagem(
        mensagemLogin,
        "Preencha o e-mail e a senha.",
        "erro"
      );

      return;
    }


    try {

      btnEntrar.disabled = true;

      btnEntrar.textContent =
        "Entrando...";


      const resposta =
        await fetch(
          "/api/login",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                email,
                senha,
              }),
          }
        );


      const dados =
        await resposta.json();


      if (!resposta.ok) {

        throw new Error(
          dados.erro ||
          "Não foi possível realizar o login."
        );

      }


      // =================================
      // SALVAR JWT
      // =================================

      localStorage.setItem(
        "token",
        dados.token
      );


      localStorage.setItem(
        "usuario",
        JSON.stringify(
          dados.usuario
        )
      );


      mostrarMensagem(
        mensagemLogin,
        "Login realizado com sucesso!",
        "sucesso"
      );


      setTimeout(() => {

        window.location.href =
          "/dashboard.html";

      }, 650);


    } catch (erro) {

      mostrarMensagem(
        mensagemLogin,
        erro.message,
        "erro"
      );


    } finally {

      btnEntrar.disabled =
        false;

      btnEntrar.textContent =
        "Entrar";

    }

  }
);


// ========================================
// CADASTRO
// ========================================

cadastroForm.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();

    limparMensagem(
      mensagemCadastro
    );


    const nome =
      cadastroNome.value.trim();

    const email =
      cadastroEmail.value.trim();

    const senha =
      cadastroSenha.value;

    const senhaConfirmada =
      confirmarSenha.value;


    if (
      !nome ||
      !email ||
      !senha ||
      !senhaConfirmada
    ) {

      mostrarMensagem(
        mensagemCadastro,
        "Preencha todos os campos.",
        "erro"
      );

      return;
    }


    if (
      senha !==
      senhaConfirmada
    ) {

      mostrarMensagem(
        mensagemCadastro,
        "As senhas não coincidem.",
        "erro"
      );

      return;
    }


    if (senha.length < 6) {

      mostrarMensagem(
        mensagemCadastro,
        "A senha precisa ter pelo menos 6 caracteres.",
        "erro"
      );

      return;
    }


    try {

      btnCadastrar.disabled =
        true;

      btnCadastrar.textContent =
        "Criando conta...";


      const resposta =
        await fetch(
          "/api/usuarios",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                nome,
                email,
                senha,
              }),
          }
        );


      const dados =
        await resposta.json();


      if (!resposta.ok) {

        throw new Error(
          dados.erro ||
          "Não foi possível criar sua conta."
        );

      }


      mostrarMensagem(
        mensagemCadastro,
        "Conta criada com sucesso!",
        "sucesso"
      );


      // DEIXA O EMAIL JÁ NO LOGIN

      loginEmail.value =
        email;


      cadastroForm.reset();


      // VOLTA AUTOMATICAMENTE
      // PARA O LOGIN

      setTimeout(() => {

        irParaLogin();

        loginSenha.focus();

      }, 1100);


    } catch (erro) {

      mostrarMensagem(
        mensagemCadastro,
        erro.message,
        "erro"
      );


    } finally {

      btnCadastrar.disabled =
        false;

      btnCadastrar.textContent =
        "Criar conta";

    }

  }
);


// ========================================
// MENSAGENS
// ========================================

function mostrarMensagem(
  elemento,
  texto,
  tipo
) {

  elemento.className =
    `mensagem ${tipo}`;

  elemento.textContent =
    texto;

}


function limparMensagem(
  elemento
) {

  elemento.className =
    "mensagem";

  elemento.textContent =
    "";

}


function limparMensagens() {

  limparMensagem(
    mensagemLogin
  );

  limparMensagem(
    mensagemCadastro
  );

}


// ========================================
// INÍCIO
// ========================================

atualizarModo();