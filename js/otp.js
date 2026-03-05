const API_URL = 'http://localhost:5000'

const digits    = document.querySelectorAll('.otp-digit')
const btnVerify = document.getElementById('btn-verify')
const errorMsg  = document.getElementById('error-msg')
const countdown = document.getElementById('countdown')

// Se não tiver email salvo, volta pro login
const otpEmail = sessionStorage.getItem('otp_email')
if (!otpEmail) {
    window.location.href = '../html/login.html'
}

// ── Countdown de 15 minutos ──────────────────────────────────────────
let totalSegundos = 15 * 60

function atualizarTimer() {
    const min = Math.floor(totalSegundos / 60)
    const seg = totalSegundos % 60
    countdown.textContent = `${min}:${seg.toString().padStart(2, '0')}`

    if (totalSegundos <= 60) {
        countdown.classList.add('expiring')
    }

    if (totalSegundos <= 0) {
        clearInterval(timerInterval)
        btnVerify.disabled = true
        errorMsg.textContent = 'Código expirado. Volte ao login e tente novamente.'
    }

    totalSegundos--
}

atualizarTimer()
const timerInterval = setInterval(atualizarTimer, 1000)

// ── Navegação automática entre os inputs ───────────────────────────
digits.forEach((input, index) => {
    input.addEventListener('input', () => {
        // Aceita só número
        input.value = input.value.replace(/\D/g, '')

        if (input.value) {
            input.classList.add('filled')
            if (index < digits.length - 1) {
                digits[index + 1].focus()
            }
        } else {
            input.classList.remove('filled')
        }
    })

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !input.value && index > 0) {
            digits[index - 1].focus()
            digits[index - 1].classList.remove('filled')
        }
    })

    // Ao colar o código inteiro
    input.addEventListener('paste', (e) => {
        e.preventDefault()
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '')
        pasted.split('').forEach((char, i) => {
            if (digits[i]) {
                digits[i].value = char
                digits[i].classList.add('filled')
            }
        })
        const nextEmpty = [...digits].findIndex(d => !d.value)
        if (nextEmpty !== -1) digits[nextEmpty].focus()
        else digits[digits.length - 1].focus()
    })
})

// ── Verificação do código ──────────────────────────────────────────
btnVerify.addEventListener('click', async () => {
    errorMsg.textContent = ''

    const code = [...digits].map(d => d.value).join('')

    if (code.length < 6) {
        return errorMsg.textContent = 'Digite os 6 dígitos do código.'
    }

    btnVerify.disabled = true
    btnVerify.textContent = 'Verificando...'

    try {
        const response = await fetch(`${API_URL}/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: otpEmail, code })
        })

        const data = await response.json()

        if (!response.ok) {
            errorMsg.textContent = data.error || 'Código inválido.'
            digits.forEach(d => {
                d.value = ''
                d.classList.remove('filled')
            })
            digits[0].focus()
            return
        }

        // Login completo — salva o JWT e limpa o email temporário
        localStorage.setItem('token', data.token)
        localStorage.setItem('username', data.name)
        sessionStorage.removeItem('otp_email')

        clearInterval(timerInterval)

        // Redireciona para a home
        window.location.href = '../html/home.html'

    } catch (err) {
        errorMsg.textContent = 'Não foi possível conectar ao servidor.'
        console.error(err)
    } finally {
        btnVerify.disabled = false
        btnVerify.textContent = 'Verificar'
    }
})

digits[0].focus()
