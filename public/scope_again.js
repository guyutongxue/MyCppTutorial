import { Arrow, Button, StatementSnippet, VariableSnippet, addCode, createFunction, createRAM } from './raphael_util.js';

// Fig. 3
{
    document.querySelector('#fig1').setAttribute('style', 'min-width: 550px');
    let fig = Raphael(document.querySelector('#fig1'), 550, 400);
    let ram = createRAM(fig, 20, 50, 300, 300);
    let main = createFunction(fig, 'main', 40, 200, 120, 100);
    let change = createFunction(fig, 'change', 180, 200, 120, 100);
    let call = new StatementSnippet(main, 10, 20, 100, 30, 'change(a,b);');
    let cout = new StatementSnippet(main, 10, 60, 100, 30, 'cout<<a<<b;');
    let assign = new StatementSnippet(change, 10, 20, 100, 30, 'a=30,b=50;')
    let a = new VariableSnippet(ram, 100, 20, 100, 30, 'a');
    let b = new VariableSnippet(ram, 100, 60, 100, 30, 'b');
    const info = [
        '',
        '计算机首先找到一片完整的内存。',
        '不同以往，变量 a 和 b 的初始化发生在最开始。当 main 函数还没有分配到内存的时候，这两个变量就已经准备就绪了。所以它们不属于任何一个函数，是独立的存在。',
        'a 和 b 初始化完毕后，才会在内存中为 main 函数开辟一片空间。',
        '开始调用 change 函数，为它开辟一片空间。',
        'change 函数为变量 a 和 b 赋值。',
        'change 函数执行完成后，其所在的存储空间被立即释放。然而 a 和 b 是全局的，不会随着 change 的消亡而消失。',
        '完成 main 函数余下过程，输出 a 和 b 的值。'
    ]
    const eventArr = [
        () => {
            ram.hide();
            main.hide();
            change.hide();
            a.hide(), b.hide();
            call.hide(), cout.hide(), assign.hide();
        },
        () => {
            ram.show();
        },
        () => {
            a.show();
            b.show();
            a.setValue('3');
            b.setValue('5');
        },
        () => {
            main.show();
        },
        () => {
            call.show();
            change.show();
        },
        () => {
            assign.show();
            a.setValue('30');
            b.setValue('50');
        },
        () => {
            assign.hide();
            change.hide();
        },
        () => {
            cout.show();
        },
    ];
    new Button(fig, document.querySelector('#fig1Text'), 400, 300, info, eventArr).insert();
}