import { Arrow, Button, StatementSnippet, VariableSnippet, addCode, createFunction, createRAM } from './raphael_util.js';

// Fig. 1
{
    document.querySelector('#fig1').setAttribute('style', 'min-width: 550px');
    let fig = Raphael(document.querySelector('#fig1'), 420, 380);
    let ram = createRAM(fig, 20, 50, 380, 300);
    let main = createFunction(fig, 'main', 40, 100, 100, 200);
    let prime = createFunction(fig, 'isPrime', 160, 100, 100, 200);
    let sqrt = createFunction(fig, 'sqrt', 280, 100, 100, 200);
    const mainCode = [
        'int a;          ',
        'cin >> a;       ',
        'if (isPrime(a)) ',
        '    cout<<"Yes";',
        'else            ',
        '    cout<<"No"; '
    ];
    addCode(main, mainCode);
    const primeCode = [
        'int r;                 ',
        'r = sqrt(x);           ',
        'for(int i{2};i<=r;i++){',
        '    if (x % i == 0)    ',
        '        return false;  ',
        '}                      ',
        'return true;           '
    ];
    addCode(prime, primeCode);
    const sqrtCode = [
        'compiled-code compi',
        'e compiled-code com',
        'ode compiled-code c',
        '-code compiled-code',
        'ed-code compiled-co',
        'iled-code compiled-',
        'mpiled-code compile',
        'compiled-code compi'
    ]
    addCode(sqrt, sqrtCode);
    new Arrow(fig, 90, 105, 90, 180);
    new Arrow(fig, 90, 180, 210, 105);
    new Arrow(fig, 210, 105, 210, 140);
    new Arrow(fig, 210, 140, 330, 105);
    new Arrow(fig, 330, 105, 330, 295);
    new Arrow(fig, 330, 295, 210, 150);
    new Arrow(fig, 210, 150, 210, 295);
    new Arrow(fig, 210, 295, 90, 190);
    new Arrow(fig, 90, 190, 90, 295);
}

// Fig. 1
{
    document.querySelector('#fig2').setAttribute('style', 'min-width: 550px');
    let fig = Raphael(document.querySelector('#fig2'), 550, 450);
    let ram = createRAM(fig, 20, 50, 500, 300);
    let main = createFunction(fig, 'main', 30, 100, 80, 200);
    let facts = [
        createFunction(fig, 'fact', 120, 100, 80, 200),
        createFunction(fig, 'fact', 210, 100, 80, 200),
        createFunction(fig, 'fact', 300, 100, 80, 200),
        createFunction(fig, 'fact', 390, 100, 80, 200)
    ];
    let arrows = [
        new Arrow(fig, 70, 105, 70, 150),
        new Arrow(fig, 70, 150, 160, 105),
        new Arrow(fig, 160, 105, 160, 190),
        new Arrow(fig, 160, 190, 250, 105),
        new Arrow(fig, 250, 105, 250, 190),
        new Arrow(fig, 250, 190, 340, 105),
        new Arrow(fig, 340, 105, 340, 190),
        new Arrow(fig, 340, 190, 430, 105),
        new Arrow(fig, 430, 105, 430, 295),
        new Arrow(fig, 430, 295, 340, 220),
        new Arrow(fig, 340, 220, 340, 295),
        new Arrow(fig, 340, 295, 250, 220),
        new Arrow(fig, 250, 220, 250, 295),
        new Arrow(fig, 250, 295, 160, 220),
        new Arrow(fig, 160, 220, 160, 295),
        new Arrow(fig, 160, 295, 70, 180),
        new Arrow(fig, 70, 180, 70, 295)
    ];

    let cout = new StatementSnippet(main, 10, 120, 60, 30, 'cout...');
    let mainCall = new StatementSnippet(main, 10, 50, 60, 30, 'fact(4);')
    let ns = [], returns = [], calls = [];
    const returnValues = [24, 6, 2, 1];
    facts.forEach((func, index) => {
        ns.push(new VariableSnippet(func, 10, 20, 60, 30, 'n').setValue((4 - index).toString()));
        if (index < 3) {
            calls.push(new StatementSnippet(func, 10, 90, 60, 30, `fact(${3 - index});`));
        }
        returns.push(new StatementSnippet(func, 10, 150, 60, 30, `return ${returnValues[index]};`));
    });

    const texts = [
        '',
        '计算机首先找到一片完整的内存。',
        '为 main 函数开辟空间。',
        '对调用表达式 <code>fact(4)</code> 进行运算。',
        '于是开辟出空间存放 <code>fact</code> 函数。传入参数 n 的值为 4。',
        '计算表达式 <code>n * fact(n - 1)</code>。此时需要求出 <code>fact(3)</code> 的值。',
        '因此<b>另开辟一块</b>内存，仍然存入 <code>fact</code> 函数。这次传入的参数 n 为 3。',
        '类似地，需要求出 <code>fact(2)</code> 的值。所以继续……',
        '开辟<b>另一块</b>内存，存入 fact 函数，参数 n 为 2。',
        '最后还需计算 <code>fact(1)</code>。所以最后开辟内存并存入 <code>fact</code>，参数 n 为 1。',
        '当 <code>n == 1</code> 成立时，就直接返回 1。将返回值传入调用方。',
        '得到 <code>fact(1)</code> 的值为 1。计算出这一层中的返回值为 1×2，即 2。',
        '得到 <code>fact(2)</code> 的值为 2。计算出这一层中的返回值为 2×3，即 6。',
        '得到 <code>fact(3)</code> 的值为 6。计算出这一层中的返回值为 6×4，即 24。',
        '最终回到 main 函数，输出 <code>fact(4)</code> 的值为 24。'
    ];
    const actions = [
        () => {
            ram.hide();
            main.hide(), facts.forEach(e => e.hide());
            arrows.forEach(e => e.hide());
            cout.hide(), mainCall.hide();
            ns.forEach(e => e.hide()), calls.forEach(e => e.hide()), returns.forEach(e => e.hide());
        },
        () => {
            ram.show();
        },
        () => {
            main.show();
        },
        () => {
            mainCall.show();
            arrows[0].show();
        },
        () => {
            facts[0].show();
            ns[0].show();
            arrows[1].show();
        },
        () => {
            calls[0].show();
            arrows[2].show();
        },
        () => {
            facts[1].show();
            ns[1].show();
            arrows[3].show();
        },
        () => {
            calls[1].show();
            arrows[4].show();
        },
        () => {
            facts[2].show();
            ns[2].show();
            arrows[5].show();
        },
        () => {
            calls[2].show();
            facts[3].show();
            ns[3].show();
            arrows[6].show(), arrows[7].show();
        },
        () => {
            returns[3].show();
            arrows[8].show(), arrows[9].show();
        },
        () => {
            returns[2].show();
            arrows[10].show(), arrows[11].show();
            facts[3].hide(), ns[3].hide(), returns[3].hide();
        },
        () => {
            returns[1].show();
            arrows[12].show(), arrows[13].show();
            facts[2].hide(), ns[2].hide(), returns[2].hide(), calls[2].hide();
        },
        () => {
            returns[0].show();
            arrows[14].show(), arrows[15].show();
            facts[1].hide(), ns[1].hide(), returns[1].hide(), calls[1].hide();
        },
        () => {
            cout.show();
            arrows[16].show();
            facts[0].hide(), ns[0].hide(), returns[0].hide(), calls[0].hide();
        }
    ];
    new Button(fig, document.querySelector('#fig2Text'), 20, 370, texts, actions).insert();
}