# 链表

先来考虑这个问题：怎样从数组中删除一个元素？

我们能做的，只有将这个元素之后的所有元素都向前“挪动”。用代码写出来就是：
```cpp
/**
 * 删除数组 arr 第 index 位置的元素，
 * size 是数组的大小
 */
void deleteElement(int* arr, unsigned int size, int index) {
    for(int i{index + 1}; i < size; i++) {
        arr[i - 1] = arr[i];
    }
}
```

但问题就来了，如果数组的大小 `size` 非常大，此时要删除首元素（`index` 为 `0`）的话就会进行许多许多次赋值，从头赋到尾，感觉非常不值得。同理，如果想要插入一个元素，也会进行许多许多次赋值。这就促使了链表的诞生。

链表和数组类似，也可以存储一系列元素。但是它插入元素和删除元素的速度都远高于数组。它的结构长成这样：

<img src="/assets/Singly-linked-list.svg" alt="Linked List">

这个图并不是那么好懂。我这样来解释：首先我们把一系列数据以一系列结构体的形式存放：
```cpp
struct Node {
    int data;
};
Node a{12};
Node b{99};
Node c{37};
```
这些结构体称为链表的节点（Node）。然后，用指针把它们连起来：
```cpp
struct Node {
    int data;
    Node* next; // 指向下一节点的指针
};
Node a{12};
Node b{99};
Node c{37};
a.next = &b;
b.next = &c;
c.next = nullptr;
```
在每一个结构体中增加一个 `Node*` 指针，指向“下一个”节点，这样就形成了一个简单的链表结构。用一句话概括就是，**链表是由指针连接的结构体**。所以我们可以通过控制指针在节点中的连接方式，来增加或删除链表中的数据。

但是在正式讲解如何构建链表之前，我们还需要一些预备知识。
