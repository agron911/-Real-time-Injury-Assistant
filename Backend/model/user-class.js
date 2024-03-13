import DAO from "./dao.js"

class User {
    constructor(username, password, status) {
        if (User.validate(username, password)) throw "Invalid username or password"

        this.username = username;
        this.status = status;
        this.password = password;
    }

    static get dao() {
        return DAO;
    }

    static get prohibitedUsernames() {
        return [
            'all','about', 'access', 'account', 'accounts', 'add', 'address', 'adm', 'admin', 'administration', 'adult',
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
        ]
    }

    static get passwordMinLength() {
        return 4;
    }

    static get usernameMinLength() {
        return 3;
    }

    static validate(username, password) {
        // Check username length
        if (!username || username.length < this.usernameMinLength) {
            console.log(`Username must be at least 3 characters long.`);
            throw new Error("Username length invalid");
        }

        // Check password length
        if (!password || password.length < this.passwordMinLength) {
            console.log(`Your password must be at least 4 characters long. Passwords are case sensitive!`);
            throw new Error("Password length invalid");
        } 

        // Check banned usernames
        if (this.prohibitedUsernames.indexOf(username) > -1) {
            console.log(`Your username is prohibited. Try again.`);
            throw new Error("Username prohibited");
        }

        return 0;
    }

    save() {
        return DAO.createUser(this.username, this.password, this.status);
    }

    static retrieve(username) {
        return DAO.getUserByName(username);
    }

    static all() {
        return DAO.getAllUsers();
    }
}

export default User;