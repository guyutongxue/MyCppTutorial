# 关键字列表

<table>
    <thead>
        <tr>
            <th class="keyword">关键字</th>
            <th class="info">说明与用法</th>
            <th class="example">举例</th>
        </tr>
    </thead>
    <tbody id="keywordTable">
    </tbody>
</table>

以下名字是保留字：它们尽管不是关键字，但仍然拥有特殊含义，应该尽量避免使用。

<table>
    <thead>
        <tr>
            <th class="keyword">保留字</th>
            <th class="info">说明与用法</th>
            <th class="example">举例</th>
        </tr>
    </thead>
    <tbody id="preservedWordTable">
    </tbody>
</table>
<script>
function loadKeywords(json_path, target) {
    (function loadJSON(path, success, error) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
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
    })(json_path,function(data){
        for (let i in data) {
            let node = document.createElement('tr');
            node.innerHTML += '<td class="keyword" rowspan="' + data[i].usage.length + '"><code>' + 
                            data[i].keyword + '</code></td>';
            let example = document.createElement('code');
            example.textContent = data[i].usage[0].example;
            example.setAttribute('class', 'language-cpp');
            node.innerHTML += '<td class="info">' + data[i].usage[0].info + '</td>'+
                            '<td class="example"><pre class="table-code"><code class="language-cpp">' + example.outerHTML +
                            '</code></pre></td>'
            target.appendChild(node);
            if (data[i].usage.length > 1) {
                for (let j = 1; j < data[i].usage.length; j++) {
                    let usage = document.createElement('tr');
                    let example = document.createElement('code');
                    example.textContent = data[i].usage[j].example;
                    example.setAttribute('class', 'language-cpp');
                    usage.innerHTML += '<td class="info">' + data[i].usage[j].info + '</td>'+
                                    '<td class="example"><pre class="table-code"><code class="language-cpp">' + example.outerHTML +
                                    '</code></pre></td>'
                    target.appendChild(usage);
                }
            }
            Prism.highlightAll();
        }
    },function(xhr){
        console.error("Load Failed.");
        console.log(xhr);
    });
};
loadKeywords("appendix/keyword.json",document.querySelector('#keywordTable'));
loadKeywords("appendix/preserved_word.json",document.querySelector('#preservedWordTable'));
</script>