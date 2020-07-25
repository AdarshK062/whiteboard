const path = require('path');
const fs= require('fs');

module.exports = function(formidable, Company){
    return {
        SetRouting: function(router){
            router.get('/dashboard', this.adminPage);
            router.post('/uploadFile', this.uploadFile);
            router.post('/dashboard', this.adminPostPage);
        },
        
        adminPage: function(req, res){
            res.render('admin/dashboard');
        },
        
        adminPostPage: function(req, res){
            const newCompany = new Company();
            newCompany.name = req.body.company;
            newCompany.country = req.body.country;
            newCompany.image = req.body.upload;
            newCompany.city=req.body.city;
            newCompany.save((err) => {
                res.render('admin/dashboard');
            })
        },
        
        uploadFile: function(req, res) 
        {
            const form = new formidable.IncomingForm();
            form.uploadDir = path.join(__dirname, '../public/uploads');
            form.on('file', (field, file) => {
                fs.rename(file.path, path.join(form.uploadDir, file.name), (err)=>{
                    if(err) throw err;
                    console.log('File renamed successfully');
                });
            });
            
            form.on('error', (err) => {
                console.log(err);
            });
            
            form.on('end', () => {
                console.log('File uploaded successful');
            });
            
            form.parse(req);
        }
    }
}