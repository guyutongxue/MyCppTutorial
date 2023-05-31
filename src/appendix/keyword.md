# 关键字列表

<table>
    <thead>
        <tr>
            <th class="keyword">关键字</th>
            <th class="info">说明与用法</th>
            <th class="example">举例</th>
        </tr>
    </thead>
    <tbody>
        <template v-for="kw of keywords">
            <tr v-for="(u, i) of kw.usage">
                <template v-if="i === 0">
                    <td :rowspan="kw.usage.length">
                        <code>{{kw.keyword}}</code>
                    </td>
                </template>
                <td>
                    <p v-html="u.info"></p>
                    <SdscBlock v-for="s of u.sdsc" :nodesJson="s" />
                </td>
                <td>
                    <div class="language-cpp">
                        <pre class="language-cpp"><code v-html="u.example"></code></pre>
                    </div>
                </td>
            </tr>
        </template>
    </tbody>
</table>

以下名字是有特殊含义的标识符：它们和关键字一样在特定场合有特殊含义，但可以用做变量名（尽管并不建议）。

<table>
    <thead>
        <tr>
        <th class="keyword">标识符</th>
        <th class="info">说明与用法</th>
        <th class="example">举例</th>
        </tr>
    </thead>
    <tbody>
        <template v-for="kw of idents">
            <tr v-for="(u, i) of kw.usage">
                <template v-if="i === 0">
                    <td :rowspan="kw.usage.length">
                        <code>{{kw.keyword}}</code>
                    </td>
                </template>
                <td>
                    <p v-html="u.info"></p>
                    <SdscBlock v-for="s of u.sdsc" :nodesJson="s" />
                </td>
                <td>
                    <div class="language-cpp">
                        <pre class="language-cpp"><code v-html="u.example"></code></pre>
                    </div>
                </td>
            </tr>
        </template>
    </tbody>
</table>


<script setup lang="ts">
import keywordSrc from "@src/appendix/keyword.yaml?raw";
import identSrc from "@src/appendix/special_ident.yaml?raw";
import { parse } from "@plugins/sdsc/parser";
import SdscBlock from "@plugins/sdsc/components/SdscBlock.vue"
import * as yaml from "yaml";
import Prism from "prismjs";
import { ref, onMounted } from "vue";

function loadKeywords(src: string) {
    const keywords = yaml.parse(src);
    for (const kw of keywords) {
        for (const u of kw.usage) {
            const parsed: string[] = [];
            for (const sdsc of u.sdsc) {
                const nodes = parse(sdsc);
                parsed.push(JSON.stringify(nodes));
            }
            u.sdsc = parsed;
            u.example = Prism.highlight(u.example, Prism.languages.cpp, 'cpp');
        }
    }
    return keywords;
}

const keywords = ref([]);
const idents = ref([]);

onMounted(() => {
    keywords.value = loadKeywords(keywordSrc);
    idents.value = loadKeywords(identSrc);
});

</script>

<style>
table pre {
    max-width: 200px;
}
table .sdsc {
    font-size: smaller;
}
</style>
