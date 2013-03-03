'use strict';
/*
var categoryService = function(ws) {
    var webService = ws;
    var categoryMap = {};
    
    var getExistingCategory = function(categortPath) {
        if (categortPath) {
            return categoryMap[categortPath];
        } else {
            return undefined;
        }
    };
    
    var parseCategoryPath = function(path) {
        if (!path || path === '') {
            return undefined;
        }
        var x = path.split('.');
        return x;
    };
    
    var findCorrectCategory = function(categories, categoryParts) {
        for (var i = 0; i < categories.length; i++) {
            var c = categories[i];
            if (categoryParts.length === 1) {
                if (!c.parent) {
                    return c;
                } else {
                    continue;
                }
            }

            // categoryParts is guarenteed to be > 1 here
            var p = c.parent, ai = categoryParts.length - 2;
            var mismatch = false;
            while (p && !mismatch) {
                if (p.name !== categoryParts[ai]) {
                    mismatch = true;
                }
                p = p.parent;
                ai--;
            }
            if (!mismatch) {
                return c;
            }
        }
    };
    
    var getCategory = function(categoryParts) {
        dump("categoryParts", categoryParts);
        if (categoryParts && categoryParts.length > 0) {
            
            
            var categories = webService.get(categoryParts[categoryParts.length - 1]);
            //dump("categories", categories);
            
            var category;
            if (categories.length > 0) {
                category = findCorrectCategory(categories, categoryParts);
                category.valid = true;
                categoryMap[category.idString()] = category;
            } else {
                category = new Category(categoryParts[categoryParts.length - 1]);
                category.valid = false;
                categoryParts.splice(-1, 1);
                category.parent = getCategory(categoryParts);
            }
        } else if(!categoryParts) {
            var category = new Category();
            category.valid = false;
        } else {
            var category = undefined;
        }

        return category;
    }
    
    var validate = function(categoryParts) {
    
        for (var i = 0; i < categoryParts.length; i++) {
            var c = getExistingCategory(categoryParts[i]);
            if (!c) {
                var cs = webService.get(categoryParts[i]);
                if (cs.length === 0) {
                    return false;
                }
            }
        }
    
        return categoryParts[categoryParts.length - 1].valid;
    };
    
    this.updateCategory = function(category, newValue) {
    
        var cachedCategory = getExistingCategory(newValue);
        
        if (cachedCategory) {
            return cachedCategory;
        } else {
            if (category.valid) {
                // old=valid_new=invalid-case
                return createCategory(newValue);
            } else {
                // old=invalid_new=*valid-case
                var categoryParts = parseCategoryPath(categoryPath);
                category.valid = validate(categoryParts);
                category.name = newValue;
            }
            return category;
        }
    };
    
    this.category = function(categoryPath) {
    
        var category = getExistingCategory(categoryPath);
        
        if (!category) {
            var categoryParts = parseCategoryPath(categoryPath);
            category = getCategory(categoryParts);
        }
        return category;
    };
};*/

describe("A Category service", function() {

  var categoryService;

  beforeEach(function() {
    var mockCategoryDao = {};
    
    module('Curo');
    module(function($provide) {
        $provide.value('CategoryDao', mockCategoryDao);
    });
    inject(function(CategoryService) {
        categoryService = CategoryService;
    });
    
    var testCategoryApa = new categoryService.Category("apa");
    //var testCategoryBepa = new categoryService.Category("bepa");
    var testCategoryApaB = new categoryService.Category("b", testCategoryApa);
    
    mockCategoryDao.query = function(params) {
        if (params.name) {
            if (params.name === 'apa') {
                return [testCategoryApa];
            } else if (params.name === 'b') {
                return [testCategoryApaB];
            } 
        }

        return [];
    };

  });
  
  describe("manages Category objects that", function() {

    var cat1, cat2, cat3, cat4;

    beforeEach(function() {
        cat1 = new categoryService.Category("apa");
        cat1.valid = true;
        cat2 = new categoryService.Category("bepa", cat1);
        cat2.valid = true;
        cat3 = new categoryService.Category("cepa", cat2);
        cat3.valid = false;
        cat4 = new categoryService.Category();
    });

    it("can have a name", function() {
        expect(cat1.name).toBe("apa");
    });

    it("with a name that is not already a category can be created", function() {
        expect(cat3.canCreate()).toBe(true);
    });

    it("with a name that is a category can not be created", function() {
        expect(cat1.canCreate()).toBe(false);
    });

    it("with no name can not be created", function() {
        expect(cat4.canCreate()).toBe(false);
    });

    it("on root level has itself as id-string", function() {
        expect(cat1.idString()).toBe("apa");
    });

    it("on lower level has a dotted notation as id-string", function() {
        expect(cat3.idString()).toBe("apa.bepa.cepa");
    });
});


  it("creates categories with root level name", function() {
    var category = categoryService.getCategory("apa");
    expect(category.name).toBe("apa");
    expect(category.valid).toBe(true);
  });
  
  it("caches categories", function() {
    var category1 = categoryService.getCategory("apa");
    var category2 = categoryService.getCategory("apa");
    expect(category1).toBe(category2);
  });
  
  it("creates categories not cached", function() {
  
    var category = categoryService.getCategory("bepa");
    expect(category.name).toBe("bepa");
    expect(category.valid).toBe(false);
  });
  
  it("creates categories with no name", function() {
    var category2 = categoryService.getCategory();
    expect(category2.name).toBe("");
    expect(category2.valid).toBe(false);
  });
  
  it("creates categories with multi level name", function() {
    var category3 = categoryService.getCategory("apa.b");
    expect(category3.name).toBe("b");
    expect(category3.valid).toBe(true);
  });
 /* 
  ////////////////////////////////////////////////////
 
  it("updates invalid -> invalid", function() {
    var category = cs.category("bepa");
    var categoryReturn = cs.updateCategory(category, "bepaa");
    
    expect(category).toBe(categoryReturn);
    expect(category.name).toBe("bepaa");
    expect(category.valid).toBe(false);
  });
  
  it("updates valid -> invalid", function() {
    var category = cs.category("apa");
    var categoryReturn = cs.updateCategory(category, "apaa");
    
    expect(category).not.toBe(categoryReturn);
    expect(category.name).toBe("apa");
    expect(category.valid).toBe(true);
    expect(categoryReturn.name).toBe("apaa");
    expect(categoryReturn.valid).toBe(false);
  });
  
  it("updates invalid -> valid", function() {
    var category = cs.category("ap");
    var categoryReturn = cs.updateCategory(category, "apa");
    
    expect(category).not.toBe(categoryReturn);
    expect(category.name).toBe("ap");
    expect(category.valid).toBe(false);
    expect(categoryReturn.name).toBe("apa");
    expect(categoryReturn.valid).toBe(true);
  });
  
  it("updates valid -> valid", function() {
    var category = cs.category("apa");
    var categoryReturn = cs.updateCategory(category, "apa.b");
    
    expect(category).not.toBe(categoryReturn);
    expect(category.name).toBe("apa");
    expect(category.valid).toBe(true);
    expect(categoryReturn.name).toBe("apa.b");
    expect(categoryReturn.valid).toBe(true);
  });
*/
  
});











