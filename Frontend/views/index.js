// const socket = io();

const usernameInput = document.getElementById('usernameInput');
const passwordInput = document.getElementById('passwordInput');
const userHelpBlock = document.getElementById('userHelpBlock');
const passwordHelpBlock = document.getElementById('passwordHelpBlock');

// List of prohibited usernames
const prohibitedUsernames = [
    'about', 'access', 'account', 'accounts', 'add', 'address', 'adm', 'admin', 'administration', 'adult',
    'advertising', 'affiliate', 'affiliates', 'ajax', 'analytics','android', 'anon', 'anonymous',
    'api', 'app', 'apps', 'archive', 'atom', 'auth', 'authentication', 'avatar',
    'backup', 'banner', 'banners', 'bin', 'billing', 'blog', 'blogs', 'board', 'bot', 'bots', 'business',
    'chat', 'cache', 'cadastro', 'calendar', 'campaign', 'careers', 'cgi', 'client', 'cliente', 'code', 
    'comercial', 'compare', 'config', 'connect', 'contact', 'contest', 'create', 'code', 'compras', 'css',
    'dashboard', 'data', 'db', 'design', 'delete', 'demo', 'design', 'designer', 'dev', 'devel', 'dir', 
    'directory', 'doc', 'docs', 'domain', 'download', 'downloads',
    'edit', 'editor', 'email', 'ecommerce',
    'forum', 'forums', 'faq', 'favorite', 'feed', 'feedback', 'flog', 'follow', 'file', 'files', 'free', 'ftp',
    'gadget', 'gadgets', 'games', 'guest', 'group', 'groups',
    'help', 'home', 'homepage', 'host', 'hosting', 'hostname', 'html', 'http', 'httpd', 'https', 'hpg',
    'info', 'information', 'image', 'img', 'images', 'imap', 'index', 'invite', 'intranet', 'indice', 'ipad', 'iphone', 'irc',
    'java', 'javascript', 'job', 'jobs', 'js', 'knowledgebase',
    'log', 'login', 'logs', 'logout', 'list', 'lists',
    'mail', 'mail1', 'mail2', 'mail3', 'mail4', 'mail5', 'mailer', 'mailing', 'mx', 'manager', 
    'marketing', 'master', 'me', 'media', 'message', 'microblog', 'microblogs', 'mine', 'mp3', 
    'msg', 'msn', 'mysql', 'messenger', 'mob', 'mobile', 'movie', 'movies', 'music', 'musicas', 'my',
    'name', 'named', 'net', 'network', 'new', 'news', 'newsletter', 'nick', 'nickname', 'notes', 'noticias', 'ns', 'ns1', 'ns2', 'ns3', 'ns4',
    'old', 'online', 'operator', 'order', 'orders',
    'page', 'pager', 'pages', 'panel', 'password', 'perl', 'pic', 'pics', 'photo', 'photos', 
    'photoalbum', 'php', 'plugin', 'plugins', 'pop', 'pop3', 'post', 'postmaster', 'postfix', 'posts', 
    'profile', 'project', 'projects', 'promo', 'pub', 'public', 'python',
    'random', 'register', 'registration', 'root', 'ruby', 'rss',
    'sale', 'sales', 'sample', 'samples', 'script', 'scripts', 'secure', 'send', 
    'service', 'shop', 'sql', 'signup', 'signin', 'search', 'security', 'settings', 'setting', 'setup', 
    'site', 'sites', 'sitemap', 'smtp', 'soporte', 'ssh', 'stage', 'staging', 'start', 'subscribe', 
    'subdomain', 'suporte', 'support', 'stat', 'static', 'stats', 'status', 'store', 'stores', 'system',
    'tablet', 'tablets', 'tech', 'telnet', 'test', 'test1', 'test2', 'test3', 'teste', 'tests', 'theme', 
    'themes', 'tmp', 'todo', 'task', 'tasks', 'tools', 'tv', 'talk',
    'update', 'upload', 'url', 'user', 'username', 'usuario', 'usage',
    'vendas', 'video', 'videos', 'visitor',
    'win', 'ww', 'www', 'www1', 'www2', 'www3', 'www4', 'www5', 'www6', 
    'www7', 'wwww', 'wws', 'wwws', 'web', 'webmail', 'website', 'websites', 'webmaster', 'workshop',
    'xxx', 'xpg', 'you', 'yourname', 'yourusername', 'yoursite', 'yourdomain'

];

function checkInput() {
    if (!usernameInput || usernameInput.value.length < 3) {
        alert(`Your username must be at least 3 characters long.`);
        return 0;
    } 

    if (!passwordInput || passwordInput.value.length < 4) {
        alert(`Your password must be at least 4 characters long. Passwords are case sensitive!`);
        return 0; 
    } 

    return 1;
}

function notProhibited(input) {
    if (prohibitedUsernames.includes(input.toLowerCase())) {
        alert(`Your username is prohibited. Try again.`);
        return 0
    }
    return 1
}


function submitForm(btn){
    console.log(`button clicked!`);
    if (checkInput() && notProhibited(usernameInput.value)) {
        if(btn.value == "login"){
            // client -> server (login info)
                console.log(`login button clicked!`);
                if (usernameInput && passwordInput) {
                console.log(usernameInput.value + passwordInput.value)
                fetch("http://localhost:3000/login", {
                    method: "POST",
                    body: JSON.stringify({
                        "username": usernameInput.value,
                        "password": passwordInput.value,
                    }),
                    headers: {
                    "Content-type": "application/json; charset=UTF-8"
                    }
                })
                .then((response) => {
                    if (response.status == 200) {
                        window.location.replace('/chatroom');
                    } else if (response.status == 403) {
                        alert(`Access denied. Username or password incorrect.`);
                    } else {
                        alert(`Username does not exist. Please register.`);
                    }
                })
                .then((json) => console.log(json));
                usernameInput.value = '';
                passwordInput.value = '';
                }
            } else {
            if (usernameInput && passwordInput) {
                console.log(usernameInput.value + passwordInput.value)
                fetch("http://localhost:3000/register", {
                    method: "POST",
                    body: JSON.stringify({
                        "username": usernameInput.value,
                        "password": passwordInput.value,
                    }),
                    headers: {
                        "Content-type": "application/json; charset=UTF-8"
                    }
                })
                .then((response) => {
                    console.log(response)
                    if (response.status == 201) {
                        alert(`Success! Please login with your new username.`);
                    }
                    else if(response.status==401){
                        alert(`Username exist. Please use a different username.`)
                    }
                     else {
                        alert(`Server experience a problem`);
                    }
                })
                .catch(error => console.log(error))
                .then((json) => console.log(json))
                usernameInput.value = '';
                passwordInput.value = '';
                }
            } 
    }
    
}