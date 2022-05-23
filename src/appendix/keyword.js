
function loadKeywords(json_path, target) {
    (function loadJSON(path, success, error) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    if (success)
                        success(JSON.parse(xhr.responseText));
                } else {
                    if (error)
                        error(xhr);
                }
            }
        };
        xhr.open("GET", path, true);
        xhr.send();
    })(json_path, data => {
        function createTds(object, node) {
            let example = document.createElement('code');
            example.textContent = object.example;
            example.setAttribute('class', 'language-cpp');
            node.innerHTML += `
<td class="info">
${object.info}
<pre class="sdsc table-code">${object.sdsc.join('<hr>')}</pre>
</td>
<td class="example">
    <pre class="table-code"><code class="language-cpp">${example.outerHTML}</code></pre>
</td>`;
            return node;
        }
        for (let i in data) {
            let node = document.createElement('tr');
            node.innerHTML += '<td class="keyword" rowspan="' + data[i].usage.length + '"><code>' +
                data[i].keyword + '</code></td>';
            target.appendChild(createTds(data[i].usage[0], node));
            if (data[i].usage.length > 1) {
                for (let j = 1; j < data[i].usage.length; j++) {
                    let usage = document.createElement('tr');
                    target.appendChild(createTds(data[i].usage[j], usage));
                }
            }
        }
        Prism.highlightAll();
    }, xhr => {
        console.error("Load Failed.");
        console.log(xhr);
    });
};
loadKeywords("appendix/keyword.json", document.querySelector('#keywordTable'));
loadKeywords("appendix/special_identifier.json", document.querySelector('#specialIdentifierTable'));