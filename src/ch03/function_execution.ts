import Raphael from "raphael";
import {
  Arrow,
  Button,
  StatementSnippet,
  VariableSnippet,
  addCode,
  createFunction,
  createRAM,
} from "./raphael_util";

export function fig1(element: HTMLElement, textElement: HTMLElement) {
  element.setAttribute("style", "min-width: 550px");
  const fig = Raphael(element, 550, 400);
  const ram = createRAM(fig, 20, 50, 300, 300);
  const main = createFunction(fig, "main", 40, 100, 100, 200);
  const mainCode = [
    "int a, b;         ",
    "cin >> a >> b;    ",
    "int c{a + b};     ",
    "cout << c << endl;",
  ];
  addCode(main, mainCode);
  const mainArrow = new Arrow(fig, 90, 105, 90, 295);
  const info = [
    "",
    "计算机首先找到一片完整的内存。",
    "计算机在内存中为 main 函数开辟一片空间，并将 main 函数的代码存储进来。",
    "计算机按顺序执行这片内存中的代码。",
  ];
  const eventArr = [
    () => {
      ram.hide();
      main.hide();
      mainArrow.hide();
    },
    () => {
      ram.show();
    },
    () => {
      main.show();
    },
    () => {
      mainArrow.show(true);
    },
  ];
  new Button(fig, textElement, 400, 300, info, eventArr).insert();
}

export function fig2(element: HTMLElement, textElement: HTMLElement) {
  element.setAttribute("style", "min-width: 550px");
  const fig = Raphael(element, 550, 400);
  const ram = createRAM(fig, 20, 50, 300, 300);
  const main = createFunction(fig, "main", 40, 100, 100, 200);
  const max = createFunction(fig, "max", 160, 100, 100, 200);
  const mainCode = [
    "int a, b, c;      ",
    "cin >> a >> b;    ",
    "c = max(a, b);    ",
    "cout << c << endl;",
  ];
  addCode(main, mainCode);
  const maxCode = [
    "int z;             ",
    "if (x > y)         ",
    "    z = x;         ",
    "else               ",
    "    z = y;         ",
    "return z;          ",
  ];
  addCode(max, maxCode);
  const topArrow = new Arrow(fig, 90, 105, 90, 225);
  const inArrow = new Arrow(fig, 90, 225, 210, 105);
  const maxArrow = new Arrow(fig, 210, 105, 210, 295);
  const outArrow = new Arrow(fig, 210, 295, 90, 235);
  const bottomArrow = new Arrow(fig, 90, 235, 90, 295);
  const info = [
    "",
    "计算机首先找到一片完整的内存。",
    "计算机在内存中为 main 函数开辟一片空间，并将 main 函数的代码存储进来。",
    "计算机按顺序执行这片内存中的代码……直到调用 max 函数。",
    "在执行调用表达式前，计算机为 max 函数开辟一片空间，并将 max 的代码存入。",
    "随后跳转到 max 函数开头……",
    "执行 max 函数直至 return 。",
    "max 函数执行完成后，退回到调用方——即 main 函数。",
    "随即存储 max 函数的空间立即被抛弃（释放）掉。",
    "完成 main 函数剩下的过程。",
  ];
  const eventArr = [
    () => {
      ram.hide();
      main.hide();
      max.hide();
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
    },
    () => {
      topArrow.show(true);
    },
    () => {
      max.show();
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
      inArrow.hide();
      maxArrow.hide();
      outArrow.hide();
    },
    () => {
      bottomArrow.show(true);
    },
  ];
  new Button(fig, textElement, 400, 300, info, eventArr).insert();
}

export function fig3(element: HTMLElement, textElement: HTMLElement) {
  element.setAttribute("style", "min-width: 550px");
  const fig = Raphael(element, 550, 400);
  const ram = createRAM(fig, 20, 50, 300, 300);
  const main = createFunction(fig, "main", 40, 100, 120, 200);
  const change = createFunction(fig, "change", 180, 100, 120, 200);
  const call = new StatementSnippet(main, 10, 120, 100, 30, "change(a,b);");
  const cout = new StatementSnippet(main, 10, 160, 100, 30, "cout<<a<<b;");
  const assign = new StatementSnippet(change, 10, 120, 100, 30, "c=30,d=50;");
  const arrows = [
    new Arrow(fig, 100, 105, 100, 225),
    new Arrow(fig, 100, 225, 240, 105),
    new Arrow(fig, 240, 105, 240, 295),
    new Arrow(fig, 240, 295, 100, 250),
    new Arrow(fig, 100, 250, 100, 295),
  ];
  const a = new VariableSnippet(main, 10, 10, 100, 30, "a");
  const b = new VariableSnippet(main, 10, 50, 100, 30, "b");
  const c = new VariableSnippet(change, 10, 10, 100, 30, "c");
  const d = new VariableSnippet(change, 10, 50, 100, 30, "d");
  const info = [
    "",
    "计算机首先找到一片完整的内存。",
    "计算机在内存中为 main 函数开辟一片空间。",
    "存储变量 a 和 b。一般地，在函数体内定义的变量将存储在函数独有的空间中，所以图中画在了 main 函数里面。",
    "开始调用 change 函数，为它开辟一片空间……",
    "按照箭头所述方向执行。首先初始化形参 c 和 d。",
    "change 函数为变量 c 和 d 赋值。",
    "change 函数执行完成后，其所在的存储空间被立即释放。",
    "完成 main 函数余下过程，输出 a 和 b 的值。",
  ];
  const eventArr = [
    () => {
      ram.hide();
      main.hide();
      change.hide();
      a.hide(), b.hide(), c.hide(), d.hide();
      call.hide(), cout.hide(), assign.hide();
      arrows.forEach((e) => {
        e.hide();
      });
    },
    () => {
      //
      ram.show();
    },
    () => {
      main.show();
    },
    () => {
      a.show();
      b.show();
      a.setValue("3");
      b.setValue("5");
    },
    () => {
      call.show();
      change.show();
    },
    async () => {
      c.show();
      d.show();
      c.setValue("3");
      d.setValue("5");

      // make arrow blink (really ugly implement)
      const sh = window.setInterval(() => arrows.forEach((e) => e.show()), 400);
      await new Promise((r) => window.setTimeout(r, 200));
      const hi = window.setInterval(() => arrows.forEach((e) => e.hide()), 400);
      await new Promise((r) => window.setTimeout(r, 1200));
      window.clearInterval(sh), window.clearInterval(hi);
      arrows.forEach((e) => e.hide());
    },
    () => {
      assign.show();
      c.setValue("30");
      d.setValue("50");
    },
    () => {
      c.hide(), d.hide();
      assign.hide();
      change.hide();
    },
    () => {
      cout.show();
    },
  ];
  new Button(fig, textElement, 400, 300, info, eventArr).insert();
}
