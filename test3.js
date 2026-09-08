const inner = `
			A &=& \\overrightarrow{P} \\cdot \\overrightarrow{d} \\\\
			&=& P \\cdot d \\cdot \\cos \\left(\\overrightarrow{P}, \\overrightarrow{d}\\right) \\\\
			&=& 4\\,900 \\cdot 20 \\cdot \\cos 85^\\circ \\\\
			&\\approx& 8\\,541 \\text{ (J)}.
`;
const fixedInner = inner.replace(/&([^&]+)&/g, '&$1');
console.log(fixedInner);
