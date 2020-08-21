# 链表的增删

## 向链表中插入元素

```cpp
Node* temp{new Node{}};
temp->next = prev->next;
prev->next = temp;
```

```cpp
Node* temp{new Node{}};
temp->next = head->next;
head = temp;
```

## 从链表中删除元素

```cpp
Node* temp{prev->next};
prev->next = temp->next;
delete temp;
```

## 链表的释放

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

```cpp
void freeList(Node* head) {
    if (!head) return;
    freeList(head->next);
    delete head;
}
```

?> [TODO]