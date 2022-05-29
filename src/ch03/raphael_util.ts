import Raphael from "raphael";
import type { RaphaelElement, RaphaelSet, RaphaelPaper } from "raphael";
import "./fig.css";

export function createRAM(
  paper: RaphaelPaper,
  l: number,
  t: number,
  w: number,
  h: number
) {
  return paper.rect(l, t, w, h, 30).attr({
    fill: "#daf2e8",
    stroke: "#005",
    "stroke-linejoin": "round",
    "stroke-width": 2,
    title: "计算机的一片内存",
  });
}

class Snippet {
  element: RaphaelElement;
  info: RaphaelElement;
  content: RaphaelSet;

  constructor(ele: RaphaelElement, mx: number, my: number, text: string) {
    this.element = ele;
    this.info = ele.paper.text(mx, my, text).attr({
      "font-size": 18,
      "font-family": "var(--code-font-family), monospace",
    });
    this.content = ele.paper.set().push(ele, this.info);
  }

  setText(text: string, isStrong: boolean) {
    this.info.attr("text", text);
    if (isStrong === true) {
      this.info.stop();
      this.info.attr({
        fill: "red",
      });
      this.info.animate(
        Raphael.animation(
          {
            fill: "black",
          },
          500,
          "ease-in"
        ).delay(500)
      );
    }
  }
  show() {
    this.content.show();
  }
  hide() {
    this.content.hide();
  }
}

export class VariableSnippet extends Snippet {
  name: string;

  /**
   *
   * @param {import("raphael").RaphaelSet|import("raphael").RaphaelElement} func
   * @param {number} dx
   * @param {number} dy
   * @param {number} w
   * @param {number} h
   * @param {string} name
   */
  constructor(
    func: RaphaelElement | RaphaelSet,
    dx: number,
    dy: number,
    w: number,
    h: number,
    name: string
  ) {
    if ("clear" in func) {
      func = func[0];
    }
    const x = func.attr("x");
    const y = func.attr("y");
    const ele = func.paper.rect(x + dx, y + dy, w, h).attr({
      fill: "white",
      stroke: "#7878de",
    });
    super(ele, x + dx + w / 2, y + dy + h / 2, name);
    this.name = name;
    this.content.attr("title", `变量 ${name}`);
  }

  setValue(value: string) {
    this.setText(`${this.name} : ${value}`, true);
    this.content.attr("title", `变量 ${this.name} 的值为 ${value}`);
    return this;
  }
}

export class StatementSnippet extends Snippet {
  name: string;

  constructor(
    func: RaphaelSet,
    dx: number,
    dy: number,
    w: number,
    h: number,
    name: string
  ) {
    const x = func[0].attr("x");
    const y = func[0].attr("y");
    const delta = 10;
    const ele = func[0].paper
      .path(
        `M${x + dx + delta} ${y + dy} h ${w - delta} l ${-delta} ${h} h ${
          -w + delta
        } Z`
      )
      .attr({
        fill: "white",
        stroke: "#7878de",
      });
    super(ele, x + dx + w / 2, y + dy + h / 2, name);
    this.name = name;
    this.setText(name, false);
    Array.from(this.info.node.children).forEach((e) => {
      e.setAttribute("textLength", `${w - delta}`);
      e.setAttribute("lengthAdjust", "spacingAndGlyphs");
    });
    this.content.attr("title", `执行语句 ${name}`);
  }
}

export function createFunction(
  paper: RaphaelPaper,
  name: string,
  l: number,
  t: number,
  w: number,
  h: number
) {
  const func = paper.rect(l, t, w, h).attr({
    fill: "white",
    stroke: "#7878de",
    "stroke-width": 2,
    title: `存放 ${name} 函数指令的空间`,
  });
  const caption = paper.text(l + w / 2, t - 20, name).attr({
    "font-size": 25,
    "font-family": "var(--code-font-family), monospace",
  });
  return paper.set().push(func, caption);
}

export function addCode(func: RaphaelSet, code: string[]) {
  const dy = func[0].attr("height") / code.length;
  const width = func[0].attr("width") - 10;
  const l = func[0].attr("x") + 5;
  const t = func[0].attr("y") + 5;
  const text = func[0].paper.text(l, t, code.join("\n")).attr({
    "text-anchor": "start",
    "font-family": "var(--code-font-family), monospace",
  });
  text.node.setAttribute("xml:space", "preserve");
  Array.from(text.node.children).forEach((e, i) => {
    e.setAttribute("dy", (i ? dy : dy / 2).toString());
    e.setAttribute("textLength", width.toString());
    e.setAttribute("lengthAdjust", "spacingAndGlyphs");
  });
  func.push(text);
}

export class Arrow {
  paper: RaphaelPaper;
  x1: number;
  x2: number;
  y1: number;
  y2: number;
  color: string;
  element: RaphaelElement;

  constructor(
    paper: RaphaelPaper,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color = "red"
  ) {
    this.paper = paper;
    this.x1 = x1;
    this.x2 = x2;
    this.y1 = y1;
    this.y2 = y2;
    if (arguments.length > 5) this.color = color;
    else this.color = "red";
    this.element = paper.path(`M ${x1} ${y1} L ${x2} ${y2}`).attr({
      stroke: this.color,
      "stroke-width": 2,
      "arrow-end": "open-midium-long",
    });
  }
  
  show(isAnime = false) {
    if (isAnime === true) {
      this.element.stop();
      const startX = (this.x2 - this.x1) / 20 + this.x1;
      const startY = (this.y2 - this.y1) / 20 + this.y1;
      this.element.attr(
        "path",
        `M ${this.x1} ${this.y1} L ${startX} ${startY}`
      );
      this.element.show();
      this.element.animate(
        { path: `M ${this.x1} ${this.y1} L ${this.x2} ${this.y2}` },
        500,
        "linear"
      );
    } else {
      this.element.show();
    }
  }
  hide() {
    this.element.hide();
  }
}

export class Button {
  paper: RaphaelPaper;
  textElement: HTMLElement;
  l: number;
  t: number;
  infoArr: string[];
  num: number;
  eventArr: (() => void)[];
  step: number;
  set: RaphaelSet;

  /**
   * @param eventArr what should happen before switching to this index
   */
  constructor(
    paper: RaphaelPaper,
    textElement: HTMLElement,
    l: number,
    t: number,
    infoArr: string[],
    eventArr: (() => void)[]
  ) {
    this.paper = paper;
    this.textElement = textElement;
    this.l = l;
    this.t = t;
    this.num = infoArr.length;
    this.infoArr = infoArr;
    this.eventArr = eventArr;
    this.step = this.num - 1;
  }
  insert() {
    const buttonElement = this.paper.rect(this.l, this.t, 100, 50).attr({
      fill: "lightgrey",
      stroke: "black",
    });
    const buttonText = this.paper
      .text(this.l + 50, this.t + 25, "开始")
      .attr("font-size", 25);
    const next = () => {
      this.step++;
      if (this.step === this.num) {
        this.step = 0;
        buttonText.attr("text", "开始");
      }
      if (this.step === 1) {
        buttonText.attr("text", "下一步");
      }
      if (this.step + 1 === this.num) {
        buttonText.attr("text", "复原");
      }
      this.textElement.innerHTML = this.infoArr[this.step];
      this.eventArr[this.step]();
    };
    this.set = this.paper.set().push(buttonElement, buttonText).click(next);
    next();
  }
}
