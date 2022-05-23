/**
 * 
 * @param {import("raphael").RaphaelPaper} paper
 * @param {number} l 
 * @param {number} t 
 * @param {number} w 
 * @param {number} h 
 * @returns {import("raphael").RaphaelElement} 
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

class Snippet {
    /**
     * 
     * @param {import("raphael").RaphaelElement} ele Graph of snippet
     * @param {string} text Text of snippet
     */
    constructor(ele, mx, my, text) {
        this.element = ele;
        this.info = ele.paper.text(mx, my, text).attr({
            'font-size': 18,
            'font-family': 'var(--code-font-family), monospace'
        });
        this.content = ele.paper.set().push(ele, this.info);
    }
    /**
     * 
     * @param {string} text 
     * @param {boolean} isStrong
     * @return {void}
     */
    setText(text, isStrong) {
        this.info.attr('text', text);
        if (isStrong === true) {
            this.info.stop();
            this.info.attr({
                'fill': 'red'
            });
            this.info.animate(Raphael.animation({
                'fill': 'black'
            }, 500, 'ease-in').delay(500));
        }
    }
    show() {
        this.content.show();
    }
    hide() {
        this.content.hide();
    }
}

class VariableSnippet extends Snippet {
    /**
     * 
     * @param {import("raphael").RaphaelSet|import("raphael").RaphaelElement} func 
     * @param {number} dx 
     * @param {number} dy 
     * @param {number} w 
     * @param {number} h 
     * @param {string} name 
     */
    constructor(func, dx, dy, w, h, name) {
        if (func.type === 'set') {
            func = func[0];
        }
        let x = func.attr('x');
        let y = func.attr('y');
        let ele = func.paper.rect(x + dx, y + dy, w, h).attr({
            fill: 'white',
            stroke: '#7878de',
        });
        super(ele, x + dx + w / 2, y + dy + h / 2, name);
        this.name = name;
        this.content.attr('title', `变量 ${name}`);
    }
    /**
     * 
     * @param {string} value 
     * @returns {VariableSnippet} this
     */
    setValue(value) {
        this.setText(`${this.name} : ${value}`, true);
        this.content.attr('title', `变量 ${this.name} 的值为 ${value}`);
        return this;
    }
}

class StatementSnippet extends Snippet {
    /**
     * 
     * @param {import("raphael").RaphaelSet} func 
     * @param {number} dx 
     * @param {number} dy 
     * @param {number} w 
     * @param {number} h 
     * @param {string} name 
     */
    constructor(func, dx, dy, w, h, name) {
        let x = func[0].attr('x');
        let y = func[0].attr('y');
        let delta = 10;
        let ele = func[0].paper.path(`M${x + dx + delta} ${y + dy} h ${w - delta} l ${-delta} ${h} h ${-w + delta} Z`).attr({
            fill: 'white',
            stroke: '#7878de',
        });
        super(ele, x + dx + w / 2, y + dy + h / 2, name);
        this.name = name;
        this.setText(name, false);
        Array.from(this.info.node.children).forEach((e) => {
            e.setAttribute('textLength', `${w - delta}`);
            e.setAttribute('lengthAdjust', 'spacingAndGlyphs');
        });
        this.content.attr('title', `执行语句 ${name}`);
    }
}

/**
 * 
 * @param {import("raphael").RaphaelPaper} paper 
 * @param {string} name
 * @param {number} l  
 * @param {number} t 
 * @param {number} w 
 * @param {number} h 
 * @returns {import("raphael").RaphaelSet}
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
 * @param {import("raphael").RaphaelSet} func 
 * @param {Array<string>} code 
 * @returns {void}
 */
function addCode(func, code) {
    const dy = func[0].attr('height') / code.length;
    const width = func[0].attr('width') - 10;
    const l = func[0].attr('x') + 5;
    const t = func[0].attr('y') + 5;
    let text = func[0].paper.text(l, t, code.join('\n')).attr({
        'text-anchor': 'start',
        'font-family': 'var(--code-font-family), monospace'
    });
    text.node.setAttribute('xml:space', 'preserve');
    Array.from(text.node.children).forEach((e, i) => {
        e.setAttribute('dy', (i ? dy : dy / 2));
        e.setAttribute('textLength', width);
        e.setAttribute('lengthAdjust', 'spacingAndGlyphs');

    });
    func.push(text);
}
class Arrow {
    /**
     * 
     * @param {import("raphael").RaphaelPaper} paper 
     * @param {number} x1 
     * @param {number} y1 
     * @param {number} x2 
     * @param {number} y2 
     * @param {string} [color='red'] 
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
        this.element = paper.path(`M ${x1} ${y1} L ${x2} ${y2}`).attr({
            stroke: this.color,
            'stroke-width': 2,
            'arrow-end': 'open-midium-long'
        });
    }
    /**
     * 
     * @param {boolean} [isAnime=false] 
     */
    show(isAnime) {
        if (isAnime === true) {
            this.element.stop();
            let startX = (this.x2 - this.x1) / 20 + this.x1;
            let startY = (this.y2 - this.y1) / 20 + this.y1;
            this.element.attr('path', `M ${this.x1} ${this.y1} L ${startX} ${startY}`);
            this.element.show();
            this.element.animate({ 'path': `M ${this.x1} ${this.y1} L ${this.x2} ${this.y2}` }, 500, 'linear');
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
     * @param {import("raphael").RaphaelPaper} paper 
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
            this.textElement.innerHTML = this.infoArr[this.step];
            this.eventArr[this.step]();
        };
        this.set = this.paper.set().push(buttonElement, buttonText).click(next);
        next();
    }
}

export { Arrow, Button, StatementSnippet, VariableSnippet, addCode, createFunction, createRAM };