# `std::map`

关联容器除了 `std::set` 及其三个变种，还有 `std::map` 及其三个变种。

`std::map` 从字面意思上，模拟了数学中“映射”的概念。但“映射”概念过于复杂了，我们姑且用其它语言中相同数据结构的名字来称呼它——字典（Dictionary）。

> 学术上正式的名称是关联数组（Associative Array），但我认为“字典”这个词最形象。

生活中，一本字典分为若干个“字头”，每一个“字头”则有它的“义项”。比如《新华字典》中就有这种文本：
```
诂 用通行的话解释古代语言文字...
牯 牯牛，指公牛...
𦙶 用于地名...
罟 捕鱼的网...
钴 金属元素，符号 Co ...
```

这里，“牯”“罟”就是字头，“指公牛”“捕鱼的网”就是“义项”。我们在使用字典的时候，首先会去查找一个字头，然后阅读这个字头对应的义项。我们希望在程序中也能编写这样一个字典，并且像查字典一样使用它。

现在，我们管字典中的字头叫“键”（Key），管义项叫做“值”（Value）。一个字头总对应一个义项，两者共同构成了“键-值对”（Key-value pair）。而字典，则是由若干个键-值对构成的集合。为了保证集合元素的唯一性，字典要求每一个键-值对中的键是唯一的；换句话说，字典中不能出现同样的字头。

好的，回到 C++ 的问题上来。`std::map` 就是模仿字典的数据结构的实现。它作为类模板接受两个类型参数：第一个是键的类型，第二个是值的类型。

下面的例子中，我用“成绩单”这种类似字典的场景来举例。成绩单中，学生姓名是键，学生成绩是值；阅读时，首先查找学生姓名，然后对应到其成绩。
```CPP
#include <string>
#include <map> // std::map 定义在此
int main() {
    // 键：学生姓名，类型为 std::string 字符串
    // 值：学生成绩，类型为 int 整数
    std::map<std::string, int> scores;
}
```
通过 `insert` 成员函数向其中插入键-值对。在 C++ 中，键值对仍然用 `std::pair` 来表示：第一成员为键，第二成员为值。

```CPP
#include <string>
#include <map>
int main() {
    std::map<std::string, int> scores;
    // 待插入的键-值对：学生 Alice 的成绩为 90
    std::pair<std::string, int> kvPair{"Alice", 90};
    scores.insert(kvPair); // 插入到 scores 中
}
```

声明一个键-值对是一个很头疼的事情，所以 C++ 提供了直接将初始化列表放到函数实参位置上的语法。此时，函数形参将会以这个初始化列表作为初始化器初始化。
```CPP
#include <string>
#include <map>
int main() {
    std::map<std::string, int> scores;
    scores.insert({"Alice", 90}); // 直接插入初始化列表
}
```

`insert` 成员函数的返回值类型是 `std::pair<iterator, bool>`。它的含义和 `std::set` 是类似的，第一成员指向刚插入的键-值对，而第二成员指示插入是否成功。

可以用若干个键-值对来直接初始化 `std::map`。出于语法限制，不可以省略类型形参。
```CPP
#include <string>
#include <map>
int main() {
    std::map<std::string, int> scores{
        {"Alice", 90},  // 键-值对，学生 Alice 的成绩为 90
        {"Bob", 80}
    };
}
```

使用 `std::map` 的方法就和查字典一样，毕竟关联容器的优势就在于查询的速度很快。为了这样做，你只需将要查询的键放在 `operator[]` 的右操作数上即可：
```CPP
#include <iostream>
#include <string>
#include <map>
int main() {
    std::map<std::string, int> scores{
        {"Alice", 90},
        {"Bob", 80}
    };
    // 查询 Alice 的成绩
    std::cout << scores["Alice"] << std::endl;
}
```

`operator[]` 也可以用于插入。如果待查询的键 `k` 并不存在，那么程序会自动将一个键值对插入进去：键是 `k`，而值则是默认初始化的。最终，程序返回到这个键-值对的值的引用，从而你可以对它赋值。说来啰嗦，在实际使用上比较显然：
```CPP
#include <iostream>
#include <string>
#include <map>
int main() {
    std::map<std::string, int> scores{
        {"Alice", 90},
        {"Bob", 80}
    };
    // 修改 Alice 的成绩
    scores["Alice"] = 88;
    // Carol 并不是已有的键。在执行下面语句时，
    // 首先会插入 {"Carol", 0} 这个键-值对，
    // 然后再做赋值的事情。
    scores["Carol"] = 75;
}
```

`std::map` 的元素是一个个的键-值对，在遍历的时候需要注意这一点。同样地，不允许通过迭代器修改键值对中的键部分，但可以修改它的值部分。
```CPP
#include <iostream>
#include <string>
#include <map>
int main() {
    std::map<std::string, int> scores{
        {"Alice", 90},
        {"Bob", 80}
    };
    scores["Carol"] = 75;
    // 注意范围 for 中元素的类型
    // 键的部分必须是 const
    for (std::pair<const std::string, int>& i : scores) {
        std::cout << i.first << " got " <<
            i.second << " score." << std::endl;
    }
}
```

当觉得类型声明麻烦的时候，就应该想起 `auto`。
 ```CPP
#include <iostream>
#include <string>
#include <map>
int main() {
    std::map<std::string, int> scores{
        {"Alice", 90},
        {"Bob", 80}
    };
    scores["Carol"] = 75;
    for (auto& i : scores) {
        std::cout << i.first << " got " <<
            i.second << " score." << std::endl;
    }
}
```

和 `std::set` 类似，如果键-值对中键的类型是自定义的结构体，则需要定义它的比较函数。此外，`std::map` 的三个变种 `std::multimap` `std::unordered_map` 和 `std::unordered_multimap` 也是类似的：带 `multi` 的允许多个相同键的键-值对存在；带 `unordered` 的版本速度较快。

