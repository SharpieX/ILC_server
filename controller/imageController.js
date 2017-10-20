const AWS = require('aws-sdk');
AWS.config.loadFromPath('./config/AwsConfig.json');
const fs = require('fs');
const S3 = new AWS.S3();

module.exports = {
    getFile: function(req, res) {
        let uuid = req.query.uuid, params = {Key: uuid, Bucket: 'ilcstorage'};
        S3.getObject(params, function (error, data) {
            if (error) {
                res.json(error);
            }
            else {
                console.log(data);
                res.setHeader('content-type', data.ContentType);
                res.send(data.Body);
            }
        });
    },

    uploadFile : function(req, res){

        let file = req.files.file;

        console.log(file);

        let fileBuffer = fs.readFileSync(file.file);

        S3.putObject({
            ACL: 'public-read',
            Bucket: 'ilcstorage',
            Key: file.uuid,
            Body: fileBuffer,
            ContentType: file.mimetype
        }, function(error, response) {
            if(error){
                res.json(error);
            } else {
                console.log('uploaded file');
                res.json(file);
            }
        });
    },
}