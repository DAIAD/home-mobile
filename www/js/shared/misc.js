Array.prototype.sum = function (prop) {
    var total = 0;
    for ( var i = 0, _len = this.length; i < _len; i++ ) {
        total += this[i][prop].value;
    }
    return total;
};

Array.prototype.move = function (old_index, new_index) {
    if (new_index >= this.length) {
        var k = new_index - this.length;
        while ((k--) + 1) {
            this.push(undefined);
        }
    }
    this.splice(new_index, 0, this.splice(old_index, 1)[0]);
    return this; // for testing purposes
};

Array.prototype.max = function() {
    return Math.max.apply(null, this);
};

Array.prototype.min = function() {
    return Math.min.apply(null, this);
};

String.prototype.insert = function (index, string) {
    if (index > 0)
        return this.substring(0, index) + string + this.substring(index, this.length);
    else
        return string + this;
};

function payloadCheckSum(aes){
    var bsd = 0;
    for (i=3; i< aes.length; i++){
        bsd = (bsd >> 1)  + (bsd << 7);
        bsd = ( bsd + aes[i]) & (255);
    }
    return bsd;
}

function int2hex(num){
    return (Math.round(num)).toString(16);
}

function hex8(val) {
    val &= 0xFF;
    var hex = Math.round(val).toString(16);
    return ("00" + hex).slice(-2);
}

function hex16(val) {
    val &= 0xFFFF;
    var hex = Math.round(val).toString(16);
    return ("0000" + hex).slice(-4);
}

function hex32(val) {
    val &= 0xFFFFFFFF;
    var hex = Math.round(val).toString(16);
    return ("00000000" + hex).slice(-8);
}

function findDeviceIndex(obj, key, value){
    for (var i = 0; i < obj.length; i++) {
        if (obj[i][key] == value) {
            return i;
        }
    }
    return null;
}

function isInArray(value, array) {
    return array.indexOf(value) > -1;
}

function findAndRemove(array, property, value) {
    $.each(array, function(index, result) {
           if(result[property] == value) {
           //Remove from array
           array.splice(index, 1);
           }
           });
}

function getObjects(obj, key, val) {
    var objects = [];
    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (typeof obj[i] == 'object') {
            objects = objects.concat(getObjects(obj[i], key, val));
        } else if (i == key && obj[key] == val) {
            objects.push(obj);
        }
    }
    return objects;
}

function base64ToArrayBuffer(base64) {
    var binary_string =  window.atob(base64);
    var len = binary_string.length;
    var bytes = new Uint8Array( len );
    for (var i = 0; i < len; i++){
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

function ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint8Array(buf));
}

function str2ab(str) {
    var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
    var bufView = new Uint8Array(buf);
    for (var i=0, strLen=str.length; i<strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

function stringGen(len){
    
    var text = " ";
    
    var charset = "abcdefghijklmnopqrstuvwxyz0123456789";
    
    for( var i=0; i < len; i++ )
        text += charset.charAt(Math.floor(Math.random() * charset.length));
    
    return text;
}


function computeHeating(type,solar){
    var val1 =  type.toString(2);
    var val2 =  (solar/4).toString(2);
    var res = ("000" + val1).slice(-3);
    var res1 = (res + ("00000" + val2).slice(-5));
    var a = parseInt(res1, 2);
    var final = a.toString(16);
    return final;
}

function computePricing(num2){
    var val1 = (9).toString(2);
    var val2 = (num2*100).toString(2);
    var res1 = ("0000" + val1).slice(-4);
    var res = (res1 + ("000000000000" + val2).slice(-12));
    var a = parseInt(res, 2);
    var final = a.toString(16);
    return  final;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getMax(arr, prop) {
    var max;
    for (var i=0 ; i<arr.length ; i++) {
        if(arr[i][prop] !== null){
            if (!max || parseInt(arr[i][prop]) > parseInt(max[prop]))
                max = arr[i];
        }
    }
    return max;
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function getBase64Image(img) {
    // Create an empty canvas element
    dimensions = {
        max_height : 800,
        max_width  : 600,
        width  : 800, // this will change
        height : 600, // this will change
        largest_property : function () {
            return this.height > this.width ? "height" : "width";
        },
        read_dimensions : function (img) {
            this.width = img.width;
            this.height = img.height;
            return this;
        },
        scaling_factor : function (original, computed) {
            return computed / original;
        },
        scale_to_fit : function () {
            var x_factor = this.scaling_factor(this.width,  this.max_width),
            y_factor = this.scaling_factor(this.height, this.max_height),
            
            largest_factor = Math.min(x_factor, y_factor);
            
            this.width  *= largest_factor;
            this.height *= largest_factor;
        }
    };
    
    var canvas = document.createElement("canvas");
    
    dimensions.read_dimensions(img).scale_to_fit();
    
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    
    // Copy the image contents to the canvas
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    
    // Get the data-URL formatted image
    // Firefox supports PNG and JPEG. You could check img.src to
    // guess the original format, but be aware the using "image/jpg"
    // will re-encode the image.
    var dataURL = canvas.toDataURL("image/png");
    
    return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
}

function fillArrayWithNumbers(n) {
    var arr = Array.apply(null, Array(n));
    return arr.map(function (x, i) { return i; });
}

