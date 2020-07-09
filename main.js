function htmlToElement(html) {
    let template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}
window.$docsify = {
    coverpage: true,
    name: '谷雨同学的 C++ 教程',
    loadSidebar: true,
    alias: {
        '/.*/_sidebar.md': '/_sidebar.md'
    },
    search: {
        paths: [],
        placeholder: '搜索...',
        noData: '无结果',
    },
    pagination: {
        previousText: '上一节',
        nextText: '下一节',
        crossChapter: true,
        crossChapterText: true,
    },
    copyCode: {
        buttonText: '复制',
        errorText: '错误',
        successText: '已复制'
    },
    noEmoji: true,
    markdown: {
        renderer: {
            // Change code block rendering. Add line-numbers class.
            code: function (code, lang) {

                // For Standard Specification block and IO block.
                if(lang == 'sdsc' | lang == 'io') {
                    return '<pre class="'+ lang + '">' + htmlToElement(marked(code)).innerHTML + '</pre>';
                }

                let cc = document.createElement('code');
                cc.textContent = code;
                cc.setAttribute('class', 'language-' + lang);
                return '<pre data-lang="' + lang + '" class="line-numbers">' + cc.outerHTML + '</pre>';
            },
            // Add Standard Specification inline block. The Syntax is `@text@`.
            codespan: function (code) {
                if (code.match(/^@.*@$/) === null) {
                    return '<code>' + code + '</code>';
                } else {
                    return '<code class="sdsc">' + htmlToElement(marked(code.substring(1, code.length - 1))).innerHTML + '</code>';
                }
            }
        }
    },
    /* Do highlighting after page loaded. */
    plugins: [
        function (hook, vm) {
            hook.doneEach(function (html) {
                Prism.highlightAll();
            })
        }
    ],
    auto2top: true,
    executeScript: true
}