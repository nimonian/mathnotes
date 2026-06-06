# 1. Basic Properties of Numbers

## Notes

The chapter develops the algebra of the real numbers from twelve basic
properties. For example, addition is associative:

$$
a + (b + c) = (a + b) + c
$$

Inline math works too: if $a \ne 0$ then $a \cdot a^{-1} = 1$.

::: theorem Trichotomy
For every number $a$, exactly one of the following holds:
$a = 0$, $a$ is in the collection $P$, or $-a$ is in the collection $P$.
:::

::: lemma
If $a \ne 0$ then $a^2 > 0$.
:::

::: corollary
$1 > 0$, since $1 = 1^2$.
:::

::: tip Key idea
Everything in elementary algebra follows from a small list of axioms —
the point of the chapter is to see *which* axioms are doing the work.
:::

## Exercises

### Exercise 1.1

> Prove that if $ax = a$ for some $a \ne 0$, then $x = 1$.

Since $a \ne 0$, the inverse $a^{-1}$ exists. Then

$$
x = 1 \cdot x = (a^{-1} a) x = a^{-1}(a x) = a^{-1} a = 1. \qquad \blacksquare
$$

### Exercise 1.2

> Prove that $x^2 - y^2 = (x - y)(x + y)$.

Expanding the right-hand side using distributivity:

$$
(x - y)(x + y) = x^2 + xy - yx - y^2 = x^2 - y^2. \qquad \blacksquare
$$
