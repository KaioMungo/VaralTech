const API_URL = 'http://localhost:5000'

const EMAILJS_SERVICE_ID  = 'service_8uz2dz8'
const EMAILJS_TEMPLATE_ID = 'template_yzq647m'
const EMAILJS_PUBLIC_KEY  = 'qz7Ir1yiu0iEjUAja'

const btnLogin = document.getElementById('btn-login')
const errorMsg = document.getElementById('error-msg')

function mostrarErro(msg) {
    errorMsg.textContent = msg
}

function limparErro() {
    errorMsg.textContent = ''
}

btnLogin.addEventListener('click', async () => {
    limparErro()

    const email    = document.getElementById('email').value.trim()
    const password = document.getElementById('password').value

    if (!email || !password) {
        return mostrarErro('Preencha todos os campos.')
    }

    btnLogin.disabled = true
    btnLogin.textContent = 'Entrando...'

    try {
        // 1. Chama o /login no back — valida senha e gera o código OTP
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        })

        const data = await response.json()

        if (!response.ok) {
            return mostrarErro(data.error || 'Email ou senha incorretos.')
        }

        // 2. Envia o código OTP para o email do usuário via EmailJS
        await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_ID,
            {
                to_email: data.email,
                to_name:  data.name,
                otp_code: data.otp_code
            },
            EMAILJS_PUBLIC_KEY
        )

        // 3. Guarda o email para usar na tela de OTP
        sessionStorage.setItem('otp_email', data.email)

        // 4. Redireciona para a tela de verificação
        window.location.href = '../html/otp.html'

    } catch (err) {
        mostrarErro('Não foi possível conectar ao servidor.')
        console.error(err)
    } finally {
        btnLogin.disabled = false
        btnLogin.textContent = 'Entrar'
    }
})
