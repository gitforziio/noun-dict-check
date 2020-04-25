
var FILENAME = '';

function onImport() {
    var fileList = document.forms["file-form"]["file-input"].files;
    // console.log(fileList);
    let file = fileList[0];
    if (file) {
        console.log(file);
        let nl = file.name.split(".");
        let nt = nl[nl.length-1];
        nl.pop();
        nl.replace(/\(\d+\)$/, '');
        FILENAME = nl.join('.')+'.json';
        var reader = new FileReader();
        reader.readAsText(file, "utf-8");
        reader.onload = function(evt) {
            // document.getElementById("the-input").value = this.result;
            // document.getElementById("the-json").value = md2json(this.result);
            var Ss = (nt == 'md' || nt == 'txt') ? md2json(this.result) : ( nt == 'json' ? JSON.parse(this.result) : []);
            console.log(Ss);
            the_vue.Ss = Ss;
        };
    }
}

function onExport() {
    let jn = JSON.stringify(the_vue.Ss);
    var file = new File([jn], (FILENAME), { type: "text/plain; charset=utf-8" });
    saveAs(file);
}

const TITLEMAP = new Map();
TITLEMAP.set("可以受数量词的修饰。（符合：+10分；不符合：0分）", "受数量词修饰");
TITLEMAP.set("不能受副词的修饰。（符合：+20分；不符合：-20分）", "不受副词修饰");
TITLEMAP.set("可以作典型的主语或宾语。（符合：+20分；不符合：0分）", "作典型主宾语");
TITLEMAP.set("可以作中心语受其他名词修饰，或者作定语直接修饰其他名词。（符合：+10分；不符合：0分）", "名词饰或饰名词");
TITLEMAP.set("可以后附助词“的”构成“的”字结构（，然后作主语、宾语或定语）。（符合：+10分；不符合：0分）", "后附“的”字结构");
TITLEMAP.set("可以后附方位词构成处所结构（，然后作 “在、到、从”等介词的宾语，这种介词结构又可以作状语或补语修饰动词性成分）。（符合：+10分；不符合：0分）", "后附方位词成处所");
TITLEMAP.set("不能作谓语和谓语核心（，所以，一般不能带宾语、也不能受状语和补语的修饰、并且不能后附时体助词“着、了、过”）。这里不考虑在特定语境中省略谓语动词而造成的表面上由名词单独作谓语的情况。（符合：+10分；不符合：-10分）", "不能作谓语核心");
TITLEMAP.set("不能作补语，并且一般不能作状语直接修饰动词性成分（，只有少数名词可以通过省略 “用、通过”等介词直接作状语修饰动词性成分）。（符合：+10分；不符合：0分）", "不能作补语");

function md2json(md) {
    let lines = md.split(/[\n\r]+/);
    let jns = [];
    for (let line of lines) {
        let result = line.match(/^([^ ]+) ?([^ ]+) ?〈([^〉 ]+), ?([^〉 ]+)〉 ?([^ ]+)/);
        if (result) {
            jns.push({
                'word': result[1],
                'pinyin': result[2],
                'cat': result[3],
                'attitude': result[4],
                'desc': result[5],
                // 'link_1': `http://ccl.pku.edu.cn:8080/ccl_corpus/search?q=${result[1]}&start=0&num=50&index=FullIndex&outputFormat=HTML&encoding=UTF-8&maxLeftLength=30&maxRightLength=30&orderStyle=score&LastQuery=&dir=xiandai&scopestr=`,
                // 'link_2': `http://ccl.pku.edu.cn:8080/ccl_corpus/pattern?q=%E4%B8%80%28v,1-2%29${result[1]}`,
                'table': {},
                'done': 0,
            });
        }
        let tb_item = line.match(/\| (\d+)\. ([^\|]+)\|([^\|]+)\|([^\|]+)\|([^\|]+)\|([^\|]+)\|/);
        if (tb_item) {
            let mch;
            if (tb_item[3].trim() == '') {
                mch = 0;
            } else if (tb_item[4].trim() == '') {
                mch = 1;
            } else {
                mch = 0;
            }
            let neg = tb_item[2].trim().match(/^不能.+/) ? 1 : 0;
            let title_origin = tb_item[2].trim();
            jns[jns.length-1].table[`item_${tb_item[1]}`] = {
                'idx': tb_item[1],
                'neg': neg,
                'match': mch,
                'examples': tb_item[5].trim(),
                'notes': tb_item[6].trim(),
                'title_origin': title_origin,
                'title': (TITLEMAP.get(title_origin)) ? TITLEMAP.get(title_origin) : title_origin,
                // 'can_match': tb_item[3].trim(),
                // 'not_match': tb_item[4].trim(),
            };
        }
    }
    return jns;
}

var the_vue = new Vue({
    el: '#bodywrap',
    data: {
        Ss: [],
    },
    methods: {
        vv: function(txt) {
            return txt.split('｜').length < 4;
        },
        vvv: function(txt) {
            let tts = txt.split('｜');
            let j1 = tts.length > 3;
            let j2 = true;
            for (let tt of tts) {
                if (tt[tt.length-1] != '。' && tt[tt.length-1] != '？' && tt[tt.length-1] != '！') {
                    j2 = false;
                }
            }
            return !(j1&&j2);
        },
    },
    created: function() {
        console.log("created");
    },
})

