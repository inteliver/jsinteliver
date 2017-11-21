function pr(name)
{
    return "Hello " + name + "!";
}

function InteliverConfig(cloudname=null, token=null){
    this.cloudname = cloudname,
    this.token = token
}

function getConfig(){
    return inteliverConfig
}

function Uploader(config){
    this.config=config
    this.utc_timestamp = new Date().getTime();

    this.upload = function(event){
        var filepath = event.target;
        if(this.config instanceof InteliverConfig){
            console.log('instance ok')
        }
        if(this.config.cloudname == null){
            console.log('cloudname not set')
        }
        if(this.config.token == null){
            console.log('token not set')
        }

        
        console.log(this.utc_timestamp)
        // var file = new File([""], filepath);
        // console.log(file.name)
        // console.log(file.size)
        // file.open("r"); // open file with read access
        // var str = "";
        // while (!file.eof) {
        //     // read each line of text
        //     str += file.readln() + "\n";
        // }

        function post_read(rawData){     
            data =  {
                'data': rawData,
                'type': '.jpg',
                'cloudname': this.config.cloudname,
                'timestamp': new Date().getTime()
            }
            
            function signature(data_dict){
                var keys = Object.keys(data_dict);
                keys.sort()
                msg = ''
                for (var i=0; i<keys.length; i++) {             
                    var key = keys[i];
                    var value = data_dict[key];
                    msg += key+'='+value
                    if(i<keys.length-1){
                        msg+='&'
                    }
                } 
                //console.log(msg)
                return msg
            }
            data['signature'] = signature(data)
            //console.log(data)
        }

        function read_binary_file(filepath, onLoadCallback){
            var reader = new FileReader();  
            rawData='123';      
            // reader.onload = function(e) {
            //     var rawData = reader.result;
            //     console.log('done')                
            //     callback(rawData)
            //     // var output = document.getElementById('output');
            //     // output.src = rawData;
            //     //document.getElementById("test").innerHTML = rawData 
            // } 
            reader.onload = onLoadCallback;
            reader.readAsBinaryString(filepath.files[0]);
        }
        
        // data =  {'data': rawData,
        // 'type': '.jpg',
        // 'cloudname': this.config.cloudname,
        // 'timestamp': this.utc_timestamp
        // }
        // reader.onerror = function(e) {
        //     console.log('Something went wrong during load data.')
        // }

        //console.log(filepath.files[0])
        
        read_binary_file(filepath, function(rawData){
            post_read(rawData.target.result)
        });
        //read_binary_file(filepath, post_read())
        //reader.readAsText(file);
        //reader.readAsDataURL(filepath.files[0]);

    }   
    this.printConfig = function(){
        console.log(this.config.cloudname)
        console.log(this.config.token)
    }

}

function InteliverRetrieve(config){
    this.config = null
    this.base_url = 'https://res.inteliver.com/media/v1'
    if(config instanceof InteliverConfig){
        this.config = config
    }
    else {
        console.log('wrong config')
        return
    }
    this.commands = []
    this.url = ''
    this.selectors_dic = {
        'height': 'i_h_',
        'width': 'i_w_',
        'center_x': 'i_c_x_',
        'center_y': 'i_c_y_',
    }
    this.operators = {
        'crop': 'i_o_crop',
        'round_crop': 'i_o_rcrop',
        'resize': 'i_o_resize',
        'resize_keep': 'i_o_resize_keep',
        'format': 'i_o_format_',
        'blur': 'i_o_blur_',
        'rotate': 'i_o_rotate_',
        'flip': 'i_o_flip_',
        'sharpen': 'i_o_sharpen',
        'pixelate': 'i_o_pixelate_',
        'gray': 'i_o_gray',
        'text': ',i_o_text_'
    }
    this.formats = {
        'JPEG': 'jpg',
        'PNG': 'png'
    }
    this.flips = {
        'horizontal': 'h',
        'vertical': 'v',
        'both': 'b'
    }
    this.select = function(selector, value){
        if(this.selectors_dic.hasOwnProperty(selector)){
            this.commands.push(this.selectors_dic[selector]+value)
        }
    }
    // def select(self, selector, value):
    // if selector in self.selectors_dic:
    //     self.commands.append('{}{}'.format(self.selectors_dic[selector], value))
    this.select_face = function(specific_face=0){
        if(specific_face > 0){
            this.commands.push('i_c_face_'+specific_face)
        }
        else{
            this.commands.push('i_c_face')
        }
    }
    // def select_face(self, specific_face=0):
    //     if specific_face:
    //         self.commands.append('{}_{}'.format('i_c_face', specific_face))
    //     else:
    //         self.commands.append('i_c_face')
    this.image_crop = function(round_crop=false){
        if(!round_crop){
            this.commands.push(this.operators['crop'])
        }
        else{
            this.commands.push(this.operators['round_crop'])
        }
    }
    // def image_crop(self, round_crop=False):
    //     if not round_crop:
    //         self.commands.append(self.operators['crop'])
    //     else:
    //         self.commands.append(self.operators['round_crop'])
    this.image_resize = function(keep_ratio=true){
        if(keep_ratio){
            this.commands.push(this.operators['resize_keep'])
        }
        else{
            this.commands.push(this.operators['resize'])
        }
    }
    // def image_resize(self, keep_ratio=True):
    //     if keep_ratio:
    //         self.commands.append(self.operators['resize_keep'])
    //     else:
    //         self.commands.append(self.operators['resize'])

    this.image_change_format = function(required_format, value=null){
        if(this.formats.hasOwnProperty(required_format)){
            if(value != null){
                this.commands.push(this.operators['format']+this.formats[required_format]+'_'+value)
                }
                else{
                    this.commands.push(this.operators['format']+this.formats[required_format])
            }
        }
    }
    // def image_change_format(self, required_format, value=None):
    //     if required_format in self.formats:
    //         if value:
    //             self.commands.append('{}{}_{}'
    //                                 .format(self.operators['format'],
    //                                         self.formats[required_format],
    //                                         value))
    //         else:
    //             self.commands.append('{}{}'
    //                                 .format(self.operators['format'],
    //                                         self.formats[required_format]))
    this.image_blur = function(value=20){
        this.commands.push(this.operators['blur']+value)
    }
    // def image_blur(self, value=20):
    //     self.commands.append('{}{}'.format(self.operators['blur'], value))
    this.image_rotate = function(rotate_degree, rotate_zoom=1){
        this.commands.push(self.operators['rotate']+rotate_degree+'_'+rotate_zoom)
    }
    // def image_rotate(self, rotate_degree, rotate_zoom=1):
    //     self.commands.append('{}{}_{}'.format(self.operators['rotate'], rotate_degree, rotate_zoom))

    this.image_flip = function(horizontal=false, vertical=false){
        if(horizontal && vertical){
            this.commands.push(this.operators['flip']+self.flips['both'])
        }
        else if(horizontal){
            this.commands.push(this.operators['flip']+self.flips['horizontal'])
        }
        else if(vertical){
            this.commands.push(this.operators['flip']+self.flips['vertical'])
        }
    }
    // def image_flip(self, horizontal=False, vertical=False):
    //     if horizontal and vertical:
    //         self.commands.append('{}{}'.format(self.selectors_dic['flip']), self.flips['both'])
    //     elif horizontal:
    //         self.commands.append('{}{}'.format(self.selectors_dic['flip']), self.flips['horizontal'])
    //     elif vertical:
    //         self.commands.append('{}{}'.format(self.selectors_dic['flip']), self.flips['vertical'])
    this.image_sharpen = function(){
        this.commands.push(this.operators['sharpen'])
    }
    // def image_sharpen(self):
    //     self.commands.append(self.operators['sharpen'])
    this.image_pixelate = function(value=10){
        this.commands.push(this.operators['pixelate']+value)
    }
    // def image_pixelate(self, value=10):
    //     self.commands.append('{}{}'.format(self.operators['pixelate'], value))

    this.image_gray_scale = function(){
        this.commands.push(this.operators['gray'])
    }
    // def image_gray_scale(self):
    //     self.commands.append(self.operators['gray'])

    this.image_text_overlay = function(){

    }
    // def image_text_overlay(self):
    //     pass

    this.build_url = function(resource_key){
        array_length = this.commands.length
        commands_string = ''
        for (var i = 0; i < array_length; i++) {
            commands_string +='/'
            commands_string += this.commands[i];            
        }
        this.url = this.base_url + '/' + this.config.cloudname + commands_string + '/' + resource_key
        return this.url
    }
    // def build_url(self, resource_key):
    //     self.url = '{}/{}'.format(','.join(self.commands), resource_key)
    //     return '{}/{}/{}'.format(self.base_url, self.config.get_cloudname(), self.url)
    this.clear_steps = function(){
        this.url = ''
        this.commands = []
    }
    // def clear_steps(self):
    //     self.url = ''
    //     self.commands = []
    this.print = function(){
        console.log(this.commands)
        console.log(this.config.cloudname)
        console.log(this.base_url)
        console.log(this.select_face)
        console.log(this.operators)
        console.log(this.flips)
        console.log(this.selectors_dic)
    }
}