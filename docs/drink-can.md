<img class="logo" src="../assets/logo/logo.png">


# 3D Assets


## Drink can

This generator creates a 3D drink can . A set of parameters
control the size and the shape of the can. It is possible to
generale low-poly drink-can by reducing the complexity,
removing edges and using flat shading. Click on a snapshot
to open it online.

<p class="gallery">

	<a class="style-block nocaption" href="../online/drink-can.html?canHeight=12&canSize=6&canComplexity=50&neckHeight=1.5&neckSize=5&hasTag=true&simple=false&flat=false">
		<img src="images/drink-can-1.png">
	</a>

	<a class="style-block nocaption" href="../online/drink-can.html?canHeight=5&canSize=7.46&canComplexity=50&neckHeight=1.5&neckSize=6.5&hasTag=true&simple=false&flat=false">
		<img src="images/drink-can-2.png">
	</a>

	<a class="style-block nocaption" href="../online/drink-can.html?canHeight=13.4&canSize=5&canComplexity=50&neckHeight=1.5&neckSize=5.9&hasTag=true&simple=false&flat=false">
		<img src="images/drink-can-3.png">
	</a>

</p>


### Code example

```js
import { DrinkCan } from "3d-assets/drink-can.js";

var model = new DrinkCan ({
	canHeight: 12,
	canSize: 6,
	canComplexity: 50,
	neckHeight: 1.5,
	neckSize: 5,
	hasTag: true,
	simple: false,
	flat: false
});
```


### Parameters

#### Can parameters

* `canHeight` &ndash; height of the drink can, in cm, [5, 20]
* `canSize` &ndash; diameter of the drink-can, in cm, [5, 8]
	
#### Neck parameters

* `neckHeight` &ndash; desired height of the neck, in cm, [1, 3]
* `neckSize` &ndash; desired size of the neck, in cm, [4, 9]

#### Complexity parameters

* `canComplexity` &ndash; number of faces along the can perimeter, [8, 120]
* `hasTag` &ndash; if *true* the lid has a 3D tag, boolean
* `simple` &ndash; if *true* the complexity of the profile is reduced, boolean
* `flat` &ndash; if *true* flat shading is used, boolean
	
	
### Internal structure

An instance of `DrinkCan` is a `THREE.Group` with submeshes
called `body` and `lid`. If `hasTag` is *true* there is also
submesh called `tag`. 



### Minimal example

[demos/minimal-drink-can.html](../demos/minimal-drink-can.html)


### Online generator

[online/drink-can.html](../online/drink-can.html)


### Source

[src/drink-can.js](https://github.com/boytchev/assets/blob/main/src/drink-can.js)

		
<div class="footnote">
	<a href="../">Home</a>
</div>