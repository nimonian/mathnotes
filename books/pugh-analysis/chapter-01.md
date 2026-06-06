# Real Numbers

## Preliminaries

When you face a problem you can't solve, make some additional assumptions and try to solve it then.

## Cuts

::: definition Cut

A **cut** in $\Q$ is a pair of disjoint, non-empty subsets $A, B$ satisfying

1. $A \cup B = \Q$
1. $a \in A, b \in B \Rightarrow a < b$
1. $A$ contains no largest element

:::

We refer to such a cut using the notation $A | B$.

::: definition Real number

A **real number** is a cut in $\Q$

:::

In the same way that $\Z$ embeds into $\Q$ by thinking of $z \in \Z$ as $\frac{z}{1} \in \Q$, the rational number $q \in \Q$ lives in $\R$ as

$$
q = \{ p \in \Q : p < q \} | \{ p \in \Q : p \geq q \}
$$

The really interesting reals are the irrational numbers. At first it's hard to think of one, but consider something like

$$
\{ p \in \Q : p \leq 0 \text{ or } p^2 < 2 \} | \{ p \in \Q : p > 0 \text{ and } p^2 \geq 2 \}
$$

This is the irrational number $\sqrt{2}$. Similar to how $\Z$ begets $\Q$ by dividing its own members, $\Q$ begets $\R$ by considering its cuts. Or, equivalently, by taking the completion of $\Q$, meaning the set of all limits of sequences in $\Q$.

Note that when $A | B$ is rational, $B$ contains a smallest element; when $A | B$ is irrational, however, it does not. This is meaningful: the point at which we're cutting belongs neither to $A$ nor $B$ - so it must be some new kind of number.

::: definition

The cut $x = A | B$ is less than or equal to the cut $y = C | D$ if $A \subseteq C$.

:::

::: definition Upper and lower bounds

$M \in \R$ is an **upper bound** for a set $S \subset \R$ if $s \leq M$ for every $s \in S$.

An upper bound that is less than all other upper bounds for $S$ is the **least upper bound** for $S$, also known as the **supremum**, denoted $\sup(S)$.

The corresponding definitions are **lower bound** and **greatest lower bound**, or **infinum**, denoted $\inf(S)$.

:::

::: theorem Least upper bound property

Is $S \subset \R$ is non-empty and bounded above, then $sup(S)$ exists.

:::

::: proof

Let $X|Y$ be any upper bound of $S$.

Let

$$
C = \{ a \in \Q : a \in A \text{ for some } A|B \in S \}
$$

and let $D = \Q - C$. Then $C | D$ is a cut.

:::