import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
    acknowledged:{
        type: Boolean,
        required: false,
    },
    online: {
        type: Boolean,
        required: false,
    }

})

const User = new mongoose.model("User", UserSchema);


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


// @return 
// 0 -> valid
// 1 -> invalid username length
// 2 -> invalid password length
// 3 -> banned usernames
export function isValid (username, password) {

    // Check username length
    if (!username || username.length < 3) {
        console.log(`Username must be at least 3 characters long.`);
        return 1;
    }

    // Check password length
    if (!password || password.length < 4) {
        console.log(`Your password must be at least 4 characters long. Passwords are case sensitive!`);
        return 2;
    } 

    // Check banned usernames
    if (prohibitedUsernames.includes(username)) {
        console.log(`Your username is prohibited. Try again.`);
        return 3;
    }

    return 0

}

export async function createUser(username, hashed_password) {
    const user = await User.insertMany({ username: username, password: hashed_password });
    return user;
}

export async function getUserByName(username) {
    console.log('usernames', username);
    const user = await User.findOne({ username: username.toLowerCase() });
    return user;
}


export async function UpdateAcknowledgement(username) {
    await User.findOneAndUpdate({ username: username }, { acknowledged: true });
}

export const setUserOnline = async(username) => {
    await User.findOneAndUpdate({ username: username }, { online: true });
}

export const setUserOffline = async(username) => {
    const user = await User.findOneAndUpdate({ username: username }, { online: false });
    console.log("user offline", user);
}

export default User;