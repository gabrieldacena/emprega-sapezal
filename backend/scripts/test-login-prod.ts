
const fs = require('fs');

const email = 'admin@admin.com';
const senha = '99157881';
const prodUrl = 'https://emprega-sapezal.onrender.com/api/auth/login';

async function testLogin() {
    console.log(`🚀 Testando login em: ${prodUrl}`);

    try {
        const response = await fetch(prodUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha }),
        });

        const data = await response.json();
        fs.writeFileSync('login_debug.json', JSON.stringify({ status: response.status, data }, null, 2));
        console.log('✅ Resposta salva em login_debug.json');
    } catch (error: any) {
        fs.writeFileSync('login_debug.json', JSON.stringify({ error: error.message }, null, 2));
        console.log('✅ Erro salvo em login_debug.json');
    }
}

testLogin();
