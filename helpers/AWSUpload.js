const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

AWS.config.update({
    accessKeyId: 'ASIATUIO6VOF7GARUL6Q',
    secretAccessKey: 'AyG47gpgbadQbRfWPfMhixPb/uHSKsCdq3g0nqHO',
    sessionToken: 'FwoGZXIvYXdzEBEaDEDs5G0cAMhYuF2iZyLEATLK8338F16rtYO+DO7NqroICGavm7Q1E8RMwdnqZuR5w5fYUJWpmQhi+3Rj24nRDOOg7fs/vpf+v9Nah2Kju0lki01FGe7L5qGIJg7OhGaY3Lr9OdccEI93qqHo3xxex1rJD6X+I4xUQ3C7q0lQm/vhKWYglKBjU1u2eKMyHPwMjHqphXLtW9rgdRqi5hHXVOiAzWng+3TykHJx5yXNKePSgU13CLj0bFXrN1z4Wj4hVpGn7WsZcgCjGT5V/8QF6SeLl30oj8r27QUyLbsBe2Mc0/7zceMvxM43PAOiOEOW0XlLSLohoWa1Z6vyqkuGF8li0jKrRTkluA==',
    region: 'ap-south-1',
    Bucket: 'onclick'
});

const s0 = new AWS.S3({});
const upload = multer({
    storage: multerS3({
        s3: s0,
        bucket: 'wbuc',
        acl: 'public-read',
        metadata: function(req, file, cb){
            cb(null, {fieldName: file.fieldname});
        },
        key: function(req, file, cb){
            cb(null, file.originalname);
        }
    }),

    rename: function (fieldname, filename) {
        return filename.replace(/\W+/g, '-').toLowerCase();
    }
})

exports.Upload = upload;