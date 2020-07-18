/**
 * 
 * @param {Paper} paper
 * @param {number} l 
 * @param {number} t 
 * @param {number} h 
 * @param {number} w 
 */
function createRAM(paper, l, t, w, h) {
    return paper.rect(l, t, w, h, 30).attr({
        fill: '#daf2e8',
        stroke: '#005',
        'stroke-linejoin': 'round',
        'stroke-width': 2,
        title: '计算机的一片内存'
    });
}
/**
 * 
 * @param {Paper} paper 
 * @param {string} name
 * @param {number} l  
 * @param {number} t 
 * @param {number} w 
 * @param {number} h 
 */
function createFunction(paper, name, l, t, w, h) {
    let func = paper.rect(l, t, w, h).attr({
        fill: 'white',
        stroke: '#7878de',
        'stroke-width': 2,
        title: `存放 ${name} 函数指令的空间`
    });
    let caption = paper.text(l + w / 2, t - 20, name).attr({
        'font-size': 25,
        'font-family': 'var(--code-font-family), monospace'
    });
    return paper.set().push(func, caption);
}
/**
 * Add codes to function figure.
 * @param {*} func 
 * @param {Array<string>} code 
 */
function addCode(func, code) {
    const dy = func.attr('height') / code.length;
    const width = func.attr('width') - 10;
    const l = func.attr('x') + 5;
    const t = func.attr('y') + 5;
    let text = func.paper.text(l, t, code.join('\n')).attr({
        'text-anchor': 'start',
        'font-family': 'var(--code-font-family), monospace'
    });
    Array.from(text.node.children).forEach((e, i) => {
        e.setAttribute('dy', (i ? dy : dy / 2));
        e.setAttribute('textLength', width);
        e.setAttribute('lengthAdjust', 'spacingAndGlyphs');
    });
    return text;
}
class Arrow {
    /**
     * 
     * @param {*} paper 
     * @param {number} x1 
     * @param {number} y1 
     * @param {number} x2 
     * @param {number} y2 
     * @param {string} color 
     */
    constructor(paper, x1, y1, x2, y2, color) {
        this.paper = paper;
        this.x1 = x1;
        this.x2 = x2;
        this.y1 = y1;
        this.y2 = y2;
        if (arguments.length > 5)
            this.color = color;
        else
            this.color = 'red';
        this.element = paper.path(`M${x1},${y1}L${x2},${y2}`).attr({
            stroke: this.color,
            'stroke-width': 2,
            'arrow-end': 'open-midium-long'
        });
    }
    /**
     * 
     * @param {boolean} isAnime 
     */
    show(isAnime) {
        if (isAnime === true) {
            let startX = (this.x2 - this.x1) / 20 + this.x1;
            let startY = (this.y2 - this.y1) / 20 + this.y1;
            this.element.attr('path', `M${this.x1},${this.y1}L${startX},${startY}`);
            this.element.show();
            this.element.animate({ 'path': `M${this.x1},${this.y1}L${this.x2},${this.y2}` }, 500, 'linear');
        } else {
            this.element.show();
        }
    }
    hide() {
        this.element.hide();
    }
}
class Button {
    /**
     * 
     * @param {*} paper 
     * @param {HTMLElement} textElement
     * @param {number} l 
     * @param {number} t 
     * @param {Array<string>} infoArr 
     * @param {Array<()=>void>} eventArr what should happen before switching to this index
     */
    constructor(paper, textElement, l, t, infoArr, eventArr) {
        this.paper = paper;
        this.textElement = textElement;
        this.l = l;
        this.t = t;
        this.num = infoArr.length;
        this.infoArr = infoArr;
        this.eventArr = eventArr;
        this.step = this.num - 1;
        this.set;
    }
    insert() {
        let buttonElement = this.paper.rect(this.l, this.t, 100, 50).attr({
            fill: 'lightgrey',
            stroke: 'black'
        });
        let buttonText = this.paper.text(this.l + 50, this.t + 25, '开始').attr('font-size', 25);
        let next = () => {
            this.step++;
            if (this.step === this.num) {
                this.step = 0;
                buttonText.attr('text', '开始');
            }
            if (this.step === 1) {
                buttonText.attr('text', '下一步');
            }
            if (this.step + 1 === this.num) {
                buttonText.attr('text', '复原');
            }
            this.textElement.textContent = this.infoArr[this.step];
            this.eventArr[this.step]();
        };
        this.set = this.paper.set().push(buttonElement, buttonText).click(next);
        next();
    }
}

// Fig. 1
{
    document.querySelector('#fig1').setAttribute('style', 'min-width: 550px');
    let fig1 = Raphael(document.querySelector('#fig1'), 550, 400);
    let ram = createRAM(fig1, 20, 50, 300, 300);
    let main = createFunction(fig1, 'main', 40, 100, 100, 200);
    const mainCode = [
        'int a, b;         ',
        'cin >> a >> b;    ',
        'int c{a + b};     ',
        'cout << c << endl;'
    ];
    let mainText = addCode(main[0], mainCode);
    let mainArrow = new Arrow(fig1, 90, 105, 90, 295);
    const info = [
        '',
        '计算机首先找到一片完整的内存。',
        '计算机在内存中为 main 函数开辟一片空间，并将 main 函数的代码存储进来。',
        '计算机按顺序执行这片内存中的代码。'
    ]
    const eventArr = [
        () => {
            ram.hide();
            main.hide();
            mainText.hide();
            mainArrow.hide();
        },
        () => { 
            ram.show();
        },
        () => {
            main.show();
            mainText.show();
        },
        () => {
            mainArrow.show(true);
        }
    ];
    new Button(fig1, document.querySelector('#fig1Text'), 400, 300, info, eventArr).insert();
}

// Fig. 2
{
    document.querySelector('#fig2').setAttribute('style', 'min-width: 550px');
    let fig1 = Raphael(document.querySelector('#fig2'), 550, 400);
    let ram = createRAM(fig1, 20, 50, 300, 300);
    let main = createFunction(fig1, 'main', 40, 100, 100, 200);
    let max = createFunction(fig1, 'max', 160, 100, 100, 200);
    const mainCode = [
        'int a, b, c;      ',
        'cin >> a >> b;    ',
        'c = max(a, b);    ',
        'cout << c << endl;'
    ];
    let mainText = addCode(main[0], mainCode);
    const maxCode = [
        'int z;             ',
        'if (x > y)         ',
        '    z = x;         ',
        'else               ',
        '    z = y;         ',
        'return z;          '
    ]
    let maxText = addCode(max[0], maxCode);
    let topArrow = new Arrow(fig1, 90, 105, 90, 225);
    let inArrow = new Arrow(fig1, 90, 225, 210, 105);
    let maxArrow = new Arrow(fig1, 210, 105, 210, 295);
    let outArrow = new Arrow(fig1, 210, 295, 90, 235);
    let bottomArrow = new Arrow(fig1, 90, 235, 90, 295);
    const info = [
        '',
        '计算机首先找到一片完整的内存。',
        '计算机在内存中为 main 函数开辟一片空间，并将 main 函数的代码存储进来。',
        '计算机按顺序执行这片内存中的代码……直到调用 max 函数。',
        '在执行调用表达式前，计算机为 max 函数开辟一片空间，并将 max 的代码存入。',
        '随后跳转到 max 函数开头……',
        '执行 max 函数直至 return 。',
        'max 函数执行完成后，退回到调用方——即 main 函数。',
        '随即存储 max 函数的空间立即被抛弃（释放）掉。',
        '完成 main 函数剩下的过程。'
    ]
    const eventArr = [
        () => {
            ram.hide();
            main.hide();
            max.hide();
            mainText.hide();
            maxText.hide();
            inArrow.hide();
            maxArrow.hide();
            outArrow.hide();
            topArrow.hide();
            bottomArrow.hide();
        },
        () => { 
            ram.show(); 
        },
        () => {
            main.show();
            mainText.show();
        },
        () => {
            topArrow.show(true);
        },
        () => {
            max.show();
            maxText.show();
        },
        () => {
            inArrow.show(true);
        },
        () => {
            maxArrow.show(true);
        },
        () => {
            outArrow.show(true);
        },
        () => {
            max.hide();
            maxText.hide();
            inArrow.hide();
            maxArrow.hide();
            outArrow.hide();
        },
        () => {
            bottomArrow.show(true);
        }
    ];
    new Button(fig1, document.querySelector('#fig2Text'), 400, 300, info, eventArr).insert();
}