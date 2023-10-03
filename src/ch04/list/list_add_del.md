# 链表的增删

## 向链表中插入元素

如果我们插入的位置不是头部，那么首先需要拿到插入位置前面的结构体，并令指针 `prev` 指向它。随后，用 `temp` 指向一个新生成的结构体，调整它们 `next` 指向的位置即可。

```cpp
Node* temp{new Node{}};
temp->next = prev->next;
prev->next = temp;
```

![图示](https://z3.ax1x.com/2021/01/26/sjlbjS.png)

如果插入的位置是头部，则需要修改 `head` 指针指向的位置。

```cpp
Node* temp{new Node{}};
temp->next = head;
head = temp;
```

## 从链表中删除元素

同样地，删除一个节点也需要先拿到前面的节点，令 `prev` 为指向前面那个节点的指针。同样地，令 `temp` 指向要删除的节点，随后调整 `next` 指针。最后别忘记释放 `temp` 这片内存。

```cpp
Node* temp{prev->next};
prev->next = temp->next;
delete temp;
```

![图示](https://z3.ax1x.com/2021/01/26/sj165n.png)

删除 `head` 指向的头结点是同样的道理。

```cpp
Node* temp{head};
head = temp->next;
delete temp;
```

## 链表的释放

我们使用完一个链表务必要将其所有节点占用的存储空间都释放掉。最典型的方法是，从头到尾一个一个删掉，直到 `nullptr` 尾部为止。

```cpp
void freeList(Node* head) {
    Node* current{};
    while (head) {
        current = head;
        head = head->next;
        delete current;
    }
}
```

当链表长度比较小时，用递归也是可以的：

```cpp
void freeList(Node* head) {
    if (!head) return;
    freeList(head->next);
    delete head;
}
```
