# 链表的构建

我们尝试来构造一个链表。因为我们需要手动控制每一个节点的增删，所以每一个节点都得是动态存储期存储的。因此每一个节点都需要通过 new 表达式来创建。

这里先复述一下节点这个结构体的定义：
```cpp codemo(show)
struct Node {
    int data;
    Node* next;
};
```

> 需要注意的是，在写下 `Node* next;` 这行声明时，`Node` 的定义还没有完成——它只是一个声明。所以，如果在这个时候写下 `Node sth;` 作为成员是会报错的。这里能够使用 `Node*` 的原因就是，C/C++ 允许定义不完整类型的指针。

我们先来创建第一个节点。链表的第一个节点称为头结点，用一个名叫 `head` 的指针指向它，并让其中 `data` 初始化为 `0`。
```cpp codemo
struct Node {
    int data;
    Node* next;
};
int main() {
    Node* head{new Node{0}};
}
```
然后，定义一个指针 `current`，指向当前正在操作的节点。现在，就让 `current` 和 `head` 都指向头结点。
```cpp codemo
struct Node {
    int data;
    Node* next;
};
int main() {
    Node* head{new Node{0}};
    Node* current{head};
}
```

现在做这样的操作：令 `current` 的 `next` 指针指向一个新节点，其 `data` 初始化为 `1`。
```cpp codemo
struct Node {
    int data;
    Node* next;
};
int main() {
    Node* head{new Node{0}};
    Node* current{head};
    (*current).next = new Node{1};
}
```

接下来，我们需要把 `current` 指针挪到新节点上。我们现在已经生成了两个节点：第一个是头结点，其 `data` 为 `0`；第二个的 `data` 为 `1`。
```cpp codemo
struct Node {
    int data;
    Node* next;
};
int main() {
    Node* head{new Node{0}};
    Node* current{head};
    (*current).next = new Node{1};
    current = (*current).next;
}
```

其实，接下来我们如果想要生成第三个节点，这个过程和之前是一样的。因为现在 `current` 节点就是第二个节点，将 `current` 节点的 `next` 指针指向一个新节点就生成了第三个节点。然后将 `current` 指向这个新节点，还可以继续生成第四个节点……
```cpp codemo
struct Node {
    int data;
    Node* next;
};
int main() {
    Node* head{new Node{0}};
    Node* current{head};
    (*current).next = new Node{1};
    current = (*current).next;
    (*current).next = new Node{2};
    current = (*current).next;
    // 可以这样一直做下去
}
```

这个过程可以用循环写出。
```cpp codemo
struct Node {
    int data;
    Node* next;
};
int main() {
    Node* head{new Node{0}};
    Node* current{head};
    int n{5}; // 节点个数
    for (int i{1}; i < n; i++) {
        (*current).next = new Node{i};
        current = (*current).next;
    }
    // [...]
}
```

当生成完 n 个节点之后，我们用 `nullptr` 来表示链表的终点，这就完成了链表的构建。上述代码构造了由 n 个节点组成的链表，其中它们存储的数据分别是 $0\sim n - 1$ 的正整数。但是这个方法不能构建不含任何节点的链表（即 `head` 为 `nullptr`），这种情况需要特殊判断。
```cpp codemo
struct Node {
    int data;
    Node* next;
};
int main() {
    Node* head{new Node{0}};
    Node* current{head};
    int n{5}; // 节点个数
    for (int i{1}; i < n; i++) {
        (*current).next = new Node{i};
        current = (*current).next;
    }
    (*current).next = nullptr;
}
```

## 链表的访问

链表可以很快地进行插入和删除操作，但相对地，若想访问其中一个节点就会比数组麻烦不少。如果想访问第 x 个节点，那我们不得不从 `head` 开始，一个一个 `next` 地去找，直到第 x 个为止。
```cpp codemo(focus=8-17)
#include <iostream>
using namespace std;

struct Node {
    int data;
    Node* next;
};

/**
 * 获取第 x 个节点（从 0 开始）
 */
Node* getNode(Node* head, unsigned int x) {
    Node* current{head};
    for (unsigned int i{0}; i < x; i++) {
        current = (*current).next;
    }
    return current;
}

int main() {
    Node* head{new Node{0}};
    Node* current{head};
    int n{5}; // 节点个数
    for (int i{1}; i < n; i++) {
        (*current).next = new Node{i};
        current = (*current).next;
    }
    (*current).next = nullptr;
    Node* thirdNode{getNode(head, 3)};
    cout << (*thirdNode).data << endl;
}
```

同样地，你可以按照这种方式一直遍历到结尾 `nullptr`：
```cpp
Node* current{head};
while (current) { // 当 current 为 nullptr 时，得到 false
    cout << (*current).data << endl;
    current = (*current).next;
}
```

## 指针成员运算符

在刚才的讨论中，我们频繁地使用一种形式的表达式：`(*a).b`，即访问一个指针指向的结构体的成员。C/C++ 为此提供了一个更方便的写法 `a->b`：

| 运算符 | 名称           | 作用            |
| ------ | -------------- | --------------- |
| `a->b` | 指针成员运算符 | 等价于 `(*a).b` |

其实 `->` 这个运算符只是提供了一个“快捷方式”，它实际上仍然是先解地址，然后取得其成员。有了它，我们可以把刚才的遍历代码改成这样：
```cpp codemo
#include <iostream>
using namespace std;

struct Node {
    int data;
    Node* next;
};

/**
 * 获取第 x 个节点（从 0 开始）
 */
Node* getNode(Node* head, unsigned int x) {
    Node* current{head};
    for (unsigned int i{0}; i < x; i++) {
        current = current->next;
    }
    return current;
}

int main() {
    Node* head{new Node{0}};
    Node* current{head};
    int n{5}; // 节点个数
    for (int i{1}; i < n; i++) {
        current->next = new Node{i};
        current = current->next;
    }
    current->next = nullptr;
    Node* thirdNode{getNode(head, 3)};
    cout << thirdNode->data << endl;
}
```

有些老师喜欢管这个运算符称为“箭头运算符”。

> 指针成员运算符和成员指针运算符（`.*`）、指针成员指针运算符（`->*`）不是一个运算符。
