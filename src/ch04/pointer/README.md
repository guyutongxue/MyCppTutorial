# 指针

指针是 C/C++ 的最大难点，但也是不得不经过的一个门槛。正因为有了指针，才让 C/C++ 和其它高级编程语言（如 Java, C# 等）有了显著的不同之处。

在了解指针这个概念之前，我们需要先了解什么是地址。比如我现在手里有一张名叫 Lenna 的图片：

<div style="width: 100%; display: flex; flex-direction: row; justify-content: center">
  <img src="http://www.lenna.org/len_std.jpg" alt="Lenna">
</div>

这张图片它可能拥有一个地址（称为统一资源定位地址（Uniform Resource Location, URL））：
```
http://www.lenna.org/len_std.jpg
```

如果我想把这张图片分享给别人，我或许可以直接发送它；但是如果因为条件限制（比如流量不足，或者短信等无法发送图片的场景）不能这样做时，我可以选择发送 `http://www.lenna.org/len_std.jpg` 这个地址。当收件人在浏览器中打开这个地址，就能够再次浏览这张图片了。

这个过程体现了地址的作用。地址就是提供寻找一个东西的方法，它和现实中的地址有着相同的作用。在 C++ 中，**任何被定义的变量都拥有其地址**。而且，我们一旦拥有了变量的地址，就可以同样轻松地访问这个地址上存放的变量。有时候，变量的地址能比变量本身具有更强大的作用。
