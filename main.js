/**
 * @param {string} html 
 */
function htmlToElement(html) {
    let template = document.createElement('template');
    html = html.trim(); // Never return a text node of whitespace as the result
    template.innerHTML = html;
    return template.content.firstChild;
}
window.$docsify = {
    coverpage: true,
    onlyCover: true,
    name: '谷雨同学的 C++ 教程',
    loadSidebar: true,
    notFoundPage: '404.html',
    alias: {
        '/.*/_sidebar.md': '/_sidebar.md'
    },
    search: {
        paths: 'auto',
        placeholder: '搜索...',
        noData: '无结果',
        depth: 2,
        hideOtherSidebarContent: true
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
            code: (code, lang) => {
                // For Standard Specification block.
                if (lang === 'sdsc') {
                    return `<pre class="sdsc">${htmlToElement(marked(code)).innerHTML}</pre>`;
                }
                // For IO block.
                if (lang === 'io') {
                    return `<div style="position:relative;"><pre class="io">${code}</pre><div class="hint">输入输出</div></div>`;
                }
                let cc = document.createElement('code');
                cc.textContent = code;
                cc.setAttribute('class', 'language-' + lang);
                let html = `<pre data-lang="${lang.toLowerCase()}" class="line-numbers">${cc.outerHTML}</pre>`;

                // Uppercase 'CPP' stands for a full code. Add 'run this code' link.
                if (lang === 'CPP') {
                    let param = new URLSearchParams();
                    param.set('code', code);
                    html += `<div class="runcode"><a href="https://guyutongxue.gitee.io/cppocui/?${param.toString()}" target="_blank"><i class="far fa-play-circle"></i>&nbsp;在线编译运行</a></div>`;
                }
                return html;
            },
            // Add Standard Specification inline block. The Syntax is `@text@`.
            codespan: (code) => {
                if (code.match(/^@.*@$/) === null) {
                    return `<code>${code}</code>`;
                } else {
                    return `<code class="sdsc">${htmlToElement(marked(code.substring(1, code.length - 1))).innerHTML}</code>`;
                }
            }
        }
    },
    plugins: [
        // Do highlighting after page loaded.
        function (hook, vm) {
            hook.doneEach(() => {
                Prism.highlightAll();
            })
        },
        // Add copyright text after copying
        function (hook, vm) {
            hook.doneEach(() => {
                document.addEventListener('copy', (event) => {
                    if (document.getSelection().anchorNode.tagName && document.getSelection().anchorNode.tagName.toLowerCase() == 'pre')
                        return;
                    const pagelink = `\n\n————————————————\n转载自谷雨同学的 C++ 教程，未经许可不得以任何方式使用。\n原文链接： ${document.location.href}`;
                    event.clipboardData.setData('text', document.getSelection() + pagelink);
                    event.preventDefault();
                });
            })
        },
        // Add comments powered by utterances
        function (hook, vm) {
            hook.doneEach(() => {
                // Add OGP meta info
                if (document.querySelector('meta[property="og:title"]') === null) {
                    let meta = document.createElement('meta');
                    meta.setAttribute('property', 'og:title')
                    document.head.appendChild(meta);
                }
                document.querySelector('meta[property="og:title"]').setAttribute('content', '[Comment] ' + document.body.getAttribute('data-page'));
                let utterances = document.createElement('script');
                utterances.type = 'text/javascript';
                utterances.async = true;
                utterances.setAttribute('issue-term', 'og:title');
                utterances.setAttribute('label', 'utterances');
                utterances.setAttribute('theme', 'github-light');
                utterances.setAttribute('repo', 'Guyutongxue/MyCppTutorial');
                utterances.crossorigin = 'anonymous';
                utterances.src = 'https://utteranc.es/client.js';
                document.querySelector('.markdown-section').appendChild(utterances);
                // For Safari on iOS, show a warning because of  browser's policy
                const ua = navigator.userAgent.toLowerCase();
                if (ua.indexOf('applewebkit') > -1 && ua.indexOf('mobile') > -1 && ua.indexOf('safari') > -1 &&
                    ua.indexOf('linux') === -1 && ua.indexOf('android') === -1 && ua.indexOf('chrome') === -1 &&
                    ua.indexOf('ios') === -1 && ua.indexOf('browser') === -1) {
                    setTimeout(() => {
                        if (document.querySelector('.utterances').clientHeight > 0) {
                            let warning = document.createElement('blockquote');
                            warning.innerHTML = '若您正在使用 iOS 上的 Safari 浏览器，您的评论功能可能被禁用。关闭 <code>设置 > Safari 浏览器 > 阻止跨网站跟踪</code> 可解决此问题。';
                            document.querySelector('.markdown-section').insertBefore(warning, document.querySelector('.utterances'));
                        }
                    }, 5000);
                }
            })
        }
    ],
    auto2top: true,
    executeScript: true
}