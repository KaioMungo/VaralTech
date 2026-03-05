const API_URL = 'http://localhost:5000'

const btnCadastro = document.getElementById('btn-cadastro')
const errorMsg    = document.getElementById('error-msg')

function mostrarErro(msg) {
    errorMsg.textContent = msg
}

function limparErro() {
    errorMsg.textContent = ''
}

btnCadastro.addEventListener('click', async () => {
    limparErro()

    const name            = document.getElementById('username').value.trim()
    const email           = document.getElementById('email').value.trim()
    const password        = document.getElementById('password').value
    const confirmpassword = document.getElementById('confirmpassword').value

    // Validações no front
    if (!name || !email || !password || !confirmpassword) {
        return mostrarErro('Preencha todos os campos.')
    }

    if (password !== confirmpassword) {
        return mostrarErro('As senhas não coincidem.')
    }

    if (password.length < 6) {
        return mostrarErro('A senha deve ter no mínimo 6 caracteres.')
    }

    btnCadastro.disabled = true
    btnCadastro.textContent = 'Cadastrando...'

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        })

        const data = await response.json()

        if (!response.ok) {
            return mostrarErro(data.error || 'Erro ao cadastrar.')
        }

        // Cadastro ok — vai pro login
        alert('Conta criada com sucesso! Faça o login.')
        window.location.href = '../html/login.html'

    } catch (err) {
        mostrarErro('Não foi possível conectar ao servidor.')
    } finally {
        btnCadastro.disabled = false
        btnCadastro.textContent = 'Cadastrar'
    }
})
