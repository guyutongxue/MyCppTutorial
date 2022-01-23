# 高阶函数

```cpp
#include <iostream>
int f(int x) {
    return x + 1;
}
int g(int x) {
    return x * 2;
}
template<typename F, typename G>
auto comb(F f, G g) {
    return [=](int x) { return f(g(x)); };
}
int main() {
    std::cout << comb(f, g)(3) << std::endl;
    std::cout << comb(g, f)(3) << std::endl;
}
```