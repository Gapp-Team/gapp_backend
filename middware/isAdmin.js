module.exports = function(req, res, next) {
    if (!req.user.isAdmin) {
        return res.status(403).send("erişim yetkiniz yok.");
    }
    next();
}

//Mongodb'de bir kullanıcıya isAdmin (true )olarak eklenecek. Daha sonra ayrı bir collection oluşturup adminler orada tutulabilir.