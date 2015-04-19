export function lifecycleManagerContract(){
	var fixtures = [];
	return {
		addFixture :(containerFactory, elementFactory, description) => {
			var fixture = {
				description : description,
				dirtyableElements: !!elementFactory().$isDirty
			};
			setFactoriesInFixture(fixture, containerFactory, elementFactory);
			addFixtureSetup(fixture);
			fixtures.push(fixture);
		},
		assertMutatorContract: (mutator, description) => {
			fixtures.forEach((fixture) => {
				mutatorContract(description, fixture, mutator);
				contractSuite(_.create(fixture, {
					containerFactory: () => {
						var result = fixture.containerFactory();
						mutator(result, fixture.elementFactory);
						return result;
					},
					description : fixture.description + ' after ' + description
				}));
			});
		},
		assertDirtyContract: () => {
			fixtures.forEach(contractSuite);
		}
	};
}

function setFactoriesInFixture(fixture, containerFactory, elementFactory) {
// since spy.reset() sucks, we use indirection as a method of resetting spies state
	var setManagerWrapper = () => fixture.setManager();
	fixture.elementFactory = fixture.dirtyableElements ? spyWrapper(setManagerWrapper) : elementFactory;
	fixture.containerFactory = () => {
		var result = containerFactory(fixture.elementFactory(), fixture.elementFactory()); // always two elements in the fixture
		if (fixture.dirtyableElements) {
			expect(
				_.all(result.__value__, (val) => !val.$setManager || val.$setManager === setManagerWrapper),
				"all dirtyable elements' $setManager methods are stubbed").to.be.true;
		}
		return result;
	};
}

function addFixtureSetup(fixture){
	fixture.setup = () => {
		beforeEach('reset', () => {
			fixture.lifecycleManager = {$change : sinon.stub()};
			fixture.container = fixture.containerFactory();
			fixture.setManager = sinon.spy();
		});
		afterEach('cleanup', () => {
			delete fixture.container;
		});
	};
}


/**
 * the contract of a mutator
 */
function mutatorContract(description, fixture, mutator) {

}

/**
 * check the dirty contract
 */
function contractSuite(fixture){

}