# 归约 <Badge type="tip" text="待更新" />

::: warning

由于归约相关的 STLv2 设施尚不成熟：
- `rg::fold` 在近期（2022 年 4 月）才被添加到 C++2b 标准中，无主流编译器支持；
- `rg::reduce` 仍不在标准中

故只能使用传统版本 STLv1。待上述设施成熟后，本节需重写。

:::

## 折叠

$$\bm a =\{x_1,x_2,\cdots,x_n\}\xrightarrow{\operatorname{fold_L}(f,x_0)}f\bigg(f\Big(f\big(f(x_0, x_1), x_2\big), x_3\Big)\cdots, x_n\bigg)=b$$

## 并行归约

$$\{x_1,\cdots,x_n\}\xrightarrow{\operatorname{reduce}(f,\cdot)}\begin{cases}
x_1,&n=1\\
f\big(\operatorname{reduce}(f,\{x_{i_1},\cdots x_{i_k}\}),\operatorname{reduce}(f,\{x_{i_{k+1}},\cdots,x_{i_n}\})\big),&n>1
\end{cases}$$

其中 $\{i\}$ 是 $\{1,\cdots,n\}$ 的任意排列，$1\leqslant k\leqslant n$ 是任意正整数。
