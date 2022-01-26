# 高阶函数

?> \[TODO\]

函数复合

```CPP
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

验证函数复合的结合律

```CPP
#include <iostream>

auto f = [](int x) { return x + 1; };
auto g = [](int x) { return x * 2; };
auto h = [](int x) { return x * x; };

template<typename F, typename G>
auto operator*(F f, G g) {
    return [=](int x) { return f(g(x)); };
}
int main() {
    std::cout << ((f * g) * h)(3) << std::endl;
    std::cout << (f * (g * h))(3) << std::endl;
}
```

求导

```cpp
#include <iostream>

constexpr double DX = 1e-6;

template<typename F>
auto d(F f) {
    return [=](double x) {
        return (f(x + DX) - f(x)) / DX;
    };
}

auto f = [](double x) { return x * x; };

int main() {
    std::cout << f(5) << std::endl;
    std::cout << d(f)(5) << std::endl;
}
```